import { Command, Option } from 'commander';
import prompts from 'prompts';
import { ConfigRuleset, OpticCliConfig, readUserConfig, VCS } from '../config';
import { errorHandler } from '../error-handler';
import { logger } from '../logger';
import { getApiFromOpticUrl, getNewTokenUrl } from '../utils/cloud-urls';
import open from 'open';
import { handleTokenInput } from './login/login';
import { matchSpecCandidates } from './diff/diff-all';
import { getCurrentBranchName, guessRemoteOrigin } from '../utils/git-utils';
import { loadSpec, loadRaw } from '../utils/spec-loaders';
import type { ParseResult } from '../utils/spec-loaders';
import {
  CompareSpecResults,
  RuleResult,
  Severity,
} from '@useoptic/openapi-utilities';
import { compute } from './diff/compute';
import { uploadDiff } from './diff/upload-diff';
import chalk from 'chalk';
import { flushEvents, trackEvent } from '../segment';
import { BreakingChangesRuleset } from '@useoptic/standard-rulesets';
import { createOpticClient } from '../client/optic-backend';
import fs from 'fs';
import {
  CommentApi,
  GithubCommenter,
  GitlabCommenter,
} from './ci/comment/comment-api';
import { CiRunDetails, getDataForCi } from '../utils/ci-data';
import {
  COMPARE_SUMMARY_IDENTIFIER,
  generateCompareSummaryMarkdown,
} from './ci/comment/common';
import { GroupedDiffs } from '@useoptic/openapi-utilities/build/openapi3/group-diff';
import { identifyOrCreateApis } from './identify-apis';
import { getDetailsForGeneration } from '../utils/generated';
import { checkOpenAPIVersion } from '@useoptic/openapi-io';

const usage = () => `

  Local usage
  ------------------------
  Find OpenAPI files in your repository, lint them and start tracking them in your dedicated Optic cloud account.
  Make some changes to the specifications and run the command again to see how Optic checks your changes:

  > optic run [--match ./specs/*.openapi.yml [--ignore ./specs/ignore.openapi.yml]]

  CI usage
  ------------------------
  Visit https://www.useoptic.com/docs/setup-ci for detailed CI setup instructions.
`;

const severities = ['none', 'error'] as const;

function getProvider() {
  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) return 'github';

  const gitlabToken = process.env.OPTIC_GITLAB_TOKEN;
  if (gitlabToken) return 'gitlab';
  else return null;
}

async function getGithubCommenter() {
  const eventFile = fs.readFileSync(process.env.GITHUB_EVENT_PATH!, 'utf8');
  const event = JSON.parse(eventFile);
  const pullRequest = event.pull_request.number;
  const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/');
  const sha = process.env.GITHUB_SHA!;
  const token = process.env.GITHUB_TOKEN!;
  const commenter = new GithubCommenter({
    owner,
    repo,
    pullRequest,
    sha,
    token,
    enterpriseBaseUrl: process.env.GITHUB_API_URL,
  });
  return commenter;
}

async function getGitlabCommenter() {
  const commenter = new GitlabCommenter({
    token: process.env.OPTIC_GITLAB_TOKEN!,
    enterpriseBaseUrl: process.env.CI_SERVER_URL,
    projectId: process.env.CI_PROJECT_ID!,
    sha: process.env.CI_COMMIT_SHA!,
    mergeRequestId: process.env.CI_MERGE_REQUEST_IID!,
  });
  return commenter;
}

async function comment(data: CiRunDetails, commenter: CommentApi, sha: string) {
  const maybeComment: { id: string; body: string } | null =
    await commenter.getComment(COMPARE_SUMMARY_IDENTIFIER);

  const body = generateCompareSummaryMarkdown({ sha }, data, {
    verbose: false,
  });

  if (maybeComment) {
    await commenter.updateComment(maybeComment.id, body);
  } else {
    if (data.completed.length > 0 || data.failed.length > 0) {
      await commenter.createComment(body);
    }
  }
}

// TODO:
// - support capture
export function registerRunCommand(cli: Command, config: OpticCliConfig) {
  cli
    .command('run')
    .description(
      `Optic's workflow command: run lint rules, breaking change checks, and spec validation. Posts the results to PR/MRs when run in CI.`
    )
    .configureHelp({ commandUsage: usage })
    .option(
      '--match <match-glob>',
      'Select local OpenAPI specifications files to handle. Comma separated glob patterns list.'
    )
    .option(
      '--ignore <ignore-glob>',
      'Select local OpenAPI specifications files to ignore. Comma separated glob patterns list.'
    )
    .addOption(
      new Option(
        '--severity <severity>',
        'Use `none` to prevent Optic from exiting 1 when issues are found.'
      )
        .choices(severities)
        .default('error')
    )
    .action(errorHandler(getRunAction(config), { command: 'run' }));
}

type RunActionOptions = {
  match?: string;
  ignore?: string;
  severity: (typeof severities)[number];
};

async function authenticateInteractive(config: OpticCliConfig) {
  const userConfig = await readUserConfig();
  if (userConfig?.token) return true;

  const { token } = await prompts(
    [
      {
        type: 'select',
        name: 'login',
        message: `This command requires a valid Optic token`,
        choices: [
          {
            title: 'Get a token from app.useoptic.com',
            value: 'open-web',
          },
          {
            title: 'Paste a token',
            value: 'paste',
          },
        ],
      },
      {
        type: 'password',
        name: 'token',
        message: 'Enter your token here:',
      },
    ],
    {
      onCancel: () => process.exit(1),
      onSubmit: (_, answer) => {
        if (answer === 'open-web')
          open(getNewTokenUrl(config.client.getWebBase()));
      },
    }
  );

  if (!token) {
    return false;
  }

  let validToken = false;
  try {
    validToken = await handleTokenInput(token, true);
  } catch (e) {
    logger.debug("Can't validate token", e);
    return false;
  }

  if (!validToken) return false;
  // TODO: associate org token to user

  config.client = createOpticClient(token);
  config.authenticationType = 'user';
  config.isAuthenticated = true;
  config.userId = token.startsWith('opat')
    ? token.slice(4).split('.')[0]
    : token;

  trackEvent('cli.login');
  await flushEvents();

  return true;
}

async function authenticateCI(config: OpticCliConfig) {
  return config.isAuthenticated;
}

type SpecReport = {
  breakingChanges?: number;
  designIssues?: number;
  path: string;
  title?: string;
  error?: string;
  changelogLink?: string;
  diffs?: number;
  endpoints?: {
    added: number;
    removed: number;
    changed: number;
  };
};

function report(report: SpecReport) {
  logger.info(`| ${chalk.bold(report.title)} (${report.path})`);
  if (report.error) {
    logger.warn(`| Optic encountered an error: ${report.error}`);
    return;
  }
  const breakingChangesReport = !report.diffs
    ? '☑️  No changes '
    : report.breakingChanges
    ? `❌ ${report.breakingChanges} breaking change${
        report.breakingChanges > 1 ? 's' : ''
      } `
    : '✅ No breaking changes ';

  const designReport = report.designIssues
    ? `❌ ${report.designIssues} design issue${
        report.designIssues > 1 ? 's' : ''
      } `
    : '✅ Design ';

  logger.info(`| ${breakingChangesReport}${designReport}`);

  if (report.changelogLink) {
    logger.info(`| View report: ${report.changelogLink}`);
  }
  logger.info('');
}

// Dirty dirty, lemon squeezy
const breakingChangesRules = new BreakingChangesRuleset();
const breakingChangesRuleNames = breakingChangesRules.rules.map((r) => r.name);
const isBreakingChange = (result: RuleResult) =>
  breakingChangesRuleNames.indexOf(result.name) > -1;

const partitionFailedResults = (results: RuleResult[]) => {
  return results.reduce(
    ([bc, d], val) => {
      if (val.exempted || val.passed) return [bc, d];
      else if (isBreakingChange(val)) return [bc + 1, d];
      else return [bc, d + 1];
    },
    [0, 0]
  );
};

const optionsForAnalytics = (options: RunActionOptions) => ({
  match: !!options.match,
  ignore: !!options.ignore,
  severity: !!options.severity,
});

const getGithubBranchName = () => {
  const headRef = process.env.GITHUB_HEAD_REF;
  if (headRef) return headRef;
  const ref = process.env.GITHUB_REF;
  if (!ref || ref.indexOf('/heads/') < 0) return undefined;
  return ref.split('/heads/')[1];
};

export const getRunAction =
  (config: OpticCliConfig) => async (options: RunActionOptions) => {
    const commentToken =
      process.env.GITHUB_TOKEN ?? process.env.OPTIC_GITLAB_TOKEN;

    const baseBranch =
      process.env.GITHUB_BASE_REF ??
      process.env.CI_MERGE_REQUEST_TARGET_BRANCH_NAME;

    const isPR = config.isInCi && !!baseBranch;

    trackEvent(
      'optic.run.init',
      {
        isInCi: config.isInCi,
        isAuthenticated: config.isAuthenticated,
        commentToken: !!commentToken,
        isPR,
        ...optionsForAnalytics(options),
      },
      config.userId
    );

    if (config.vcs?.type !== VCS.Git) {
      const error = `Error: optic must be called from a git repository.`;
      logger.error(chalk.red(error));
      trackEvent(
        'optic.run.error',
        {
          isInCi: config.isInCi,
          error,
        },
        config.userId
      );
      process.exitCode = 1;
      return;
    }

    const currentBranch =
      getGithubBranchName() ??
      process.env.CI_COMMIT_REF_NAME ??
      (await getCurrentBranchName());

    const currentBranchCloudTag = `gitbranch:${currentBranch}`;

    const cloudTag = baseBranch
      ? `gitbranch:${baseBranch}`
      : currentBranchCloudTag;

    const authentified = config.isInCi
      ? await authenticateCI(config)
      : await authenticateInteractive(config);

    if (!authentified) {
      logger.error(
        chalk.red('A valid Optic token is required to run this command.')
      );
      process.exitCode = 1;
      return;
    }

    const match = options.match ?? `**/*.(json|yml|yaml)`;
    const localSpecPathsUnchecked = await matchSpecCandidates(
      match,
      options.ignore
    );

    const localSpecPaths: string[] = [];
    for (const path of localSpecPathsUnchecked) {
      try {
        const spec = await loadRaw(path, config);
        if (checkOpenAPIVersion(spec)) localSpecPaths.push(path);
      } catch (e) {
        continue;
      }
    }

    if (!localSpecPaths.length) {
      logger.info(
        `Optic couldn't find any OpenAPI specification in your repository${
          options.match || options.ignore ? ` that matches your filters` : ''
        }.`
      );
      logger.info('');
      logger.info(
        `ℹ️  No OpenAPI file yet? Get one: https://www.useoptic.com/docs/how-to-generate-openapi`
      );
      return;
    }

    logger.info(
      `Optic matched ${localSpecPaths.length} OpenAPI specification file${
        localSpecPaths.length > 1 ? 's' : ''
      }:`
    );
    logger.info(`${localSpecPaths.join(', ')}.\n`);

    const generatedDetails = await getDetailsForGeneration(config);
    if (!generatedDetails) return;

    logger.info(`--------------------------------------------------------------------------------------------------

 ┌─────────────────────────────────┐
 │  [1]      Optic Cloud      [2]  │
 └───┬─────────────────────────▲───┘
     │Compare            Update│
 ┌───▼─────────────────────────┴───┐
 │           Local specs           │
 └─────────────────────────────────┘

 [1]: Comparing your local specifications to their last uploaded Optic cloud version for tag \`${cloudTag}\`.
      Optic compares local specs against the target branch upon PR/MR events, and the current branch upon push events or local runs.

 [2]: Pushing local specs as latest versions in Optic cloud for tag \`${currentBranchCloudTag}\`, the current branch tag.

--------------------------------------------------------------------------------------------------`);
    if (!commentToken && isPR) {
      logger.info(
        `Pass a GITHUB_TOKEN or OPTIC_GITLAB_TOKEN environment variable with write permission to let Optic post comment with API change summaries to your pull requests.\n`
      );
    }
    logger.info('');

    const specReports: SpecReport[] = [];
    let pathUrls: Map<string, string>;
    try {
      pathUrls = await identifyOrCreateApis(
        config,
        localSpecPaths,
        generatedDetails
      );
    } catch (e) {
      logger.error(`${e}`);
      return;
    }
    const allChecks: Awaited<ReturnType<typeof compute>>['checks'][] = [];

    let results: {
      warnings: string[];
      groupedDiffs: GroupedDiffs;
      results: RuleResult[];
      name: string;
      specUrl: string;
      changelogUrl: string;
    }[] = [];

    for (const [path, opticUrl] of pathUrls.entries()) {
      let specResults: CompareSpecResults,
        warnings: string[],
        checks: any,
        standard: ConfigRuleset[],
        changelogData: GroupedDiffs,
        changelogUrl: string | undefined,
        specUrl: string | undefined;

      const specReport: SpecReport = { path };
      specReports.push(specReport);

      let localSpec: ParseResult;
      try {
        localSpec = await loadSpec(path, config, {
          strict: true,
          denormalize: true,
        });
      } catch (e) {
        specReport.error = `Invalid specification: ${e}`;
        continue;
      }

      specReport.title = localSpec.jsonLike.info.title;

      let cloudSpec: ParseResult | undefined = undefined;
      let specDetails: ReturnType<typeof getApiFromOpticUrl>;
      try {
        specDetails = getApiFromOpticUrl(opticUrl);
      } catch (e) {
        specReport.error = `Failed to load API from Optic: ${e}`;
        continue;
      }
      if (!specDetails) {
        specReport.error = `Could not load API form Optic ${opticUrl}`;
        continue;
      }
      try {
        cloudSpec = await loadSpec(
          `cloud:${specDetails.apiId}@${cloudTag}`,
          config,
          {
            strict: false,
            denormalize: true,
          }
        );
      } catch (e) {
        specReport.error = `Failed to load cloud specification: ${e}`;
        continue;
      }

      if (cloudSpec.jsonLike['x-optic-ci-empty-spec']) {
        cloudSpec.jsonLike.info.title = localSpec.jsonLike.info.title;
        cloudSpec.jsonLike.info.version = localSpec.jsonLike.info.version;
        cloudSpec.jsonLike.openapi = localSpec.jsonLike.openapi;
      }

      ({ specResults, standard, checks, changelogData, warnings } =
        await compute([cloudSpec, localSpec], config, {
          check: true,
          path,
        }));

      specReport.diffs = specResults.diffs.length;

      let upload: Awaited<ReturnType<typeof uploadDiff>>;
      try {
        upload = await uploadDiff(
          {
            from: cloudSpec,
            to: localSpec,
          },
          specResults,
          config,
          specDetails,
          {
            standard,
            silent: true,
            currentBranch,
          }
        );
        specUrl = upload?.headSpecUrl ?? undefined;
        changelogUrl = upload?.changelogUrl ?? undefined;
      } catch (e) {
        specReport.error = `Failed to upload run to Optic: ${e}`;
        continue;
      }
      specReport.changelogLink = upload?.changelogUrl;
      const [breakingChanges, designIssues] = partitionFailedResults(
        specResults.results
      );

      specReport.designIssues = designIssues;
      specReport.breakingChanges = breakingChanges;
      allChecks.push(checks);

      results.push({
        groupedDiffs: changelogData,
        warnings,
        name: path,
        specUrl: specUrl ?? '',
        changelogUrl: changelogUrl ?? '',
        results: specResults.results,
      });

      report(specReport);
    }

    if (commentToken && isPR) {
      const data = results.map((result) => ({
        warnings: result.warnings,
        groupedDiffs: result.groupedDiffs,
        results: result.results,
        name: result.name ?? 'Unknown comparison',
        specUrl: result.specUrl,
        changelogUrl: result.changelogUrl,
      }));

      switch (getProvider()) {
        case 'github': {
          const commenter = await getGithubCommenter();
          const sha = process.env.GITHUB_SHA!;

          await comment(
            await getDataForCi(data, { severity: Severity.Error }),
            commenter,
            sha
          );

          break;
        }
        case 'gitlab': {
          const commenter = await getGitlabCommenter();
          const sha = process.env.CI_COMMIT_SHA!;

          await comment(
            await getDataForCi(data, { severity: Severity.Error }),
            commenter,
            sha
          );

          break;
        }
      }
    }

    const hasFailures =
      allChecks.some((checks) => checks.failed.error > 0) ||
      specReports.some((r) => r.error);

    const exit1 = options.severity === 'error' && hasFailures;

    const maybeOrigin =
      config.vcs?.type === VCS.Git ? await guessRemoteOrigin() : null;

    trackEvent(
      'optic.run.complete',
      {
        isInCi: config.isInCi,
        specs: localSpecPaths.length,
        failed_specs: specReports.filter((s) => s.error).length,
        spec_with_design_issues: specReports.filter((s) => s.designIssues)
          .length,
        spec_with_breaking_changes: specReports.filter((s) => s.breakingChanges)
          .length,
        exit1,
        webUrl: maybeOrigin?.web_url,
        ...optionsForAnalytics(options),
      },
      config.userId
    );

    await flushEvents();

    logger.info('');

    if (!config.isInCi) {
      logger.info(
        `🤖 Add Optic to your CI flow: https://www.useoptic.com/docs/setup-ci`
      );
    }

    if (config.isInCi && !commentToken) {
      logger.info(
        `💬 Configure commenting on PR/MR: https://www.useoptic.com/docs/setup-ci#configure-commenting-on-pull-requests-optional`
      );
    }

    if (config.isDefaultConfig) {
      logger.info(
        `🔧 Customize your governance rules: https://www.useoptic.com/docs/lint-openapi`
      );
    }

    if (exit1) {
      logger.info('');
      logger.info(
        'Exiting with code 1 as errors were found. Disable this behaviour with the `--severity none` option.'
      );
      process.exitCode = 1;
    }
  };
