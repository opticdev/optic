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
import { OPTIC_URL_KEY } from '../constants';
import { checkOpenAPIVersion } from '@useoptic/openapi-io';
import { getDetailsForGeneration } from '../utils/generated';
import path from 'path';
import {
  CompareSpecResults,
  OpenAPIV3,
  RuleResult,
  sanitizeGitTag,
  Severity,
} from '@useoptic/openapi-utilities';
import * as Types from '../client/optic-backend-types';
import chunk from 'lodash.chunk';
import { getApiUrl } from '../utils/cloud-urls';
import { compute } from './diff/compute';
import { uploadDiff } from './diff/upload-diff';
import { uploadSpec } from '../utils/cloud-specs';
import chalk from 'chalk';
import { flushEvents, trackEvent } from '../segment';
import { BreakingChangesRuleset } from '@useoptic/standard-rulesets';
import { createOpticClient } from '../client/optic-backend';
import fs from 'fs';
import { CommentApi, GithubCommenter } from './ci/comment/comment-api';
import { CiRunDetails, getDataForCi } from '../utils/ci-data';
import {
  COMPARE_SUMMARY_IDENTIFIER,
  generateCompareSummaryMarkdown,
} from './ci/comment/common';
import { GroupedDiffs } from '@useoptic/openapi-utilities/build/openapi3/group-diff';

const usage = () => `

  Run Optic locally
  ------------------------
  Run \`optic run\` to discover OpenAPI files in your repositorty and start tracking them in your dedicated Optic cloud account.
  Make some changes to the specifications and run the same command again to see how Optic handles changes to your specs:

  > optic run [--match ./specs/*.openapi.yml [--ignore ./specs/ignore.openapi.yml]]

  CI setup: Github Action
  ------------------------
  On pull request, check changes to your specifications and post a summary to the PR:

  > OPTIC_TOKEN=\${{ secrets.OPTIC_TOKEN }} GITHUB_TOKEN=\${{ secrets.GITHUB_TOKEN }} optic run --base "gitbranch:$GITHUB_BASE_REF" --comment

  On push, push the latest specifications versions to Optic cloud:

  > OPTIC_TOKEN=\${{ secrets.OPTIC_TOKEN }} optic run
`;

const helpText = ``;

const severities = ['none', 'error'] as const;

function getProvider() {
  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) return 'github';
  else return null;
}

// TODO: support enterprise base url
async function getGitHubCommenter() {
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
  });
  return commenter;
}

async function comment(data: CiRunDetails, commenter: CommentApi, sha: string) {
  const maybeComment: { id: string; body: string } | null =
    await commenter.getComment(COMPARE_SUMMARY_IDENTIFIER);

  const body = generateCompareSummaryMarkdown({ sha }, data, {
    verbose: false, // TODO
  });

  if (maybeComment) {
    // If there's a comment already, we need to check whether this session newer than the posted comment
    await commenter.updateComment(maybeComment.id, body);
  } else {
    // if does not have comment, we should only comment when there is a completed or failed session
    if (data.completed.length > 0 || data.failed.length > 0) {
      await commenter.createComment(body);
    }
  }
}

// TODO:
// - support comment for Gitlab
// - support capture
// - check userId analytics
// - support tags option?
export function registerRunCommand(cli: Command, config: OpticCliConfig) {
  cli
    .command('run')
    .addHelpText('after', helpText)
    .description(
      `Integrate Optic to your CI flow and immediately start shipping better APIs:
- prevent shipping unintentional breaking changes
- enforce API design, including Spectral rules and forwards-only governance
- get cloud benefits: stats, shareable changelogs, documentation hubs with time travel and more`
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
    .option(
      '--base <base-comparison-tag>',
      'Specify a cloud tag to compare local versions of your OpenAPI specs against, e.g. "gitbranch:main". Defaults to `gitbranch:<current-branch>`.'
    )
    .option(
      '--comment',
      '(GitHub only) Post a summary as pull request comment when your OpenAPI specifications changed. Optic will post a single comment and update it when the specs change again. GITHUB_TOKEN must be passed in the environment.'
    )
    .addOption(
      new Option(
        '--severity <severity>',
        'Specify the severity level to exit with exit code upon issues. Use `none` to disable exit 1 upon error.'
      )
        .choices(severities)
        .default('error')
    )
    .action(errorHandler(getRunAction(config), { command: 'run' }));
}

type RunActionOptions = {
  match?: string;
  ignore?: string;
  base?: string;
  severity: (typeof severities)[number];
  comment?: boolean;
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

  config.client = createOpticClient(token);
  config.authenticationType = 'user';
  config.isAuthenticated = true;
  config.userId = token.startsWith('opat')
    ? token.slice(4).split('.')[0]
    : undefined;

  trackEvent(
    'optic.run.token.valid',
    {
      isInCi: config.isInCi,
      tokenType: token.startsWith('opat') ? 'pat' : 'org',
    },
    config.userId
  );

  return true;
}

async function authenticateCI(config: OpticCliConfig) {
  return config.isAuthenticated;
}

async function identifyOrCreateApis(
  config: OpticCliConfig,
  localSpecPaths: string[]
) {
  // TODO: improve logging in getDetailsForGeneration
  const generatedDetails = await getDetailsForGeneration(config);
  if (!generatedDetails) throw new Error('Could not determine remote branch'); // TODO: report

  const { web_url, organization_id, default_branch, default_tag } =
    generatedDetails;

  const pathUrls = new Map<string, string>();

  for await (const specPath of localSpecPaths) {
    let rawSpec: OpenAPIV3.Document<{}>;

    try {
      rawSpec = await loadRaw(specPath, config);
    } catch (e) {
      logger.error('Error loading raw spec', e);
      continue; // TODO: handle failures
    }

    try {
      checkOpenAPIVersion(rawSpec);
    } catch (e) {
      logger.error('Error checking OpenAPI version', e);
      continue; // TODO: handle failures
    }

    const opticUrl = rawSpec[OPTIC_URL_KEY];
    const relativePath = path.relative(config.root, path.resolve(specPath));
    pathUrls.set(relativePath, opticUrl);
  }

  let apis: (Types.Api | null)[] = [];
  const chunks = chunk([...pathUrls.keys()], 20);
  for (const chunk of chunks) {
    const { apis: apiChunk } = await config.client.getApis(chunk, web_url);
    apis.push(...apiChunk);
  }

  for (const api of apis) {
    if (api) {
      pathUrls.set(
        api.path,
        getApiUrl(config.client.getWebBase(), api.organization_id, api.api_id)
      );
    }
  }

  for (let [path, url] of pathUrls.entries()) {
    if (!url) {
      const api = await config.client.createApi(organization_id, {
        name: path,
        path,
        web_url: web_url,
        default_branch,
        default_tag,
      });
      const url = getApiUrl(
        config.client.getWebBase(),
        organization_id,
        api.id
      );
      pathUrls.set(path, url);
    }
  }

  return pathUrls;
}

type SpecReport = {
  breakingChanges?: number;
  designIssues?: number;
  noRemoteSpec?: boolean;
  path: string;
  title?: string;
  error?: string;
  changelogLink?: string;
  endpoints?: {
    added: number;
    removed: number;
    changed: number;
  };
};

function report(
  options: RunActionOptions,
  specReports: SpecReport[],
  branchTag: string
) {
  for (const report of specReports) {
    logger.info(`| ${chalk.bold(report.title)} (${report.path})`);
    if (report.error) {
      logger.warn(`| Optic encountered an error: ${report.error}`);
      return;
    }
    if (report.noRemoteSpec) {
      if (options.base) {
        logger.warn(
          `| ⚠️  Optic is trying to compare your spec with its latest uploaded version on tag \`${options.base}\`, but none was found.`
        );
        logger.warn(
          `| To compare specs to a "gitbranch:<branch>" base, make sure \`optic run\` was called from the target base branch.`
        );
      } else {
        logger.info(
          `| First version pushed on Optic cloud with tag \`${branchTag}\`. Make changes to your local spec and run again to see how Optic compares the two versions.`
        );
      }
    }
    const breakingChangesReport = report.noRemoteSpec
      ? ''
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
      logger.info(`| View report: ${chalk.blue(report.changelogLink)}.`);
    }
    logger.info('');
  }
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
  comment: options.comment,
  match: !!options.match,
  ignore: !!options.ignore,
  severity: !!options.severity,
});

export const getRunAction =
  (config: OpticCliConfig) => async (options: RunActionOptions) => {
    trackEvent(
      'optic.run.init',
      {
        isInCi: config.isInCi,
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

    const match = options.match ?? '**/*.(json|yml|yaml)';
    const localSpecPaths = await matchSpecCandidates(match, options.ignore);
    if (!localSpecPaths.length) {
      logger.info(
        `Optic couldn't find any OpenAPI specification in your repository${
          options.match || options.ignore ? ` that matches your criteria` : ''
        }.`
      );
      logger.info('');
      // TODO: "generate from code" splash page
      logger.info(`ℹ️  Don't have an OpenAPI file yet? Check our guides on how to get one:
- from your test HTTP traffic: https://www.useoptic.com/docs/capturing-traffic
- from your code: https://www.useoptic.com/docs/generating-openapi/express
`);
      return;
    }

    // TODO: check what happens if we don't have a branch
    const branch =
      process.env.GITHUB_HEAD_REF ?? (await getCurrentBranchName());
    const branchTag = `gitbranch:${branch}`;

    const baseTag = options.base ?? branchTag;

    logger.info(
      `Optic found ${localSpecPaths.length} OpenAPI specification files to handle.`
    );
    logger.info(
      branchTag === baseTag
        ? `Your specifications will be pushed to tag \`${branchTag}\` on Optic cloud.\n`
        : `Your specifications will be compared against their latest Optic cloud versions on tag \`${baseTag}\`, then pushed to tag: \`${branchTag}\`.\n`
    );

    const specReports: SpecReport[] = [];
    const pathUrls = await identifyOrCreateApis(config, localSpecPaths);
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

      let headSpec: ParseResult;
      try {
        headSpec = await loadSpec(path, config, {
          strict: false, // TODO
          denormalize: true,
        });
      } catch (e) {
        specReport.error = `Invalid specification: ${e}`;
        continue;
      }

      specReport.title = headSpec.jsonLike.info.title;

      let baseSpec: ParseResult | undefined = undefined;
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
        baseSpec = await loadSpec(
          `cloud:${specDetails.apiId}@${baseTag}`,
          config,
          {
            strict: false, // TODO
            denormalize: true,
          }
        );
      } catch (_e) {}

      if (baseSpec && baseSpec.jsonLike['x-optic-ci-empty-spec'] !== true) {
        ({ specResults, standard, checks, changelogData, warnings } =
          await compute([baseSpec, headSpec], config, {
            check: true,
            path,
          }));

        let upload: Awaited<ReturnType<typeof uploadDiff>>;
        try {
          upload = await uploadDiff(
            {
              from: baseSpec,
              to: headSpec,
            },
            specResults,
            config,
            specDetails,
            {
              //headTag: options.headTag, TODO
              standard,
              silent: true,
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
      } else {
        specReport.noRemoteSpec = true;

        try {
          // TODO: specUrl in this case
          await uploadSpec(specDetails.apiId, {
            spec: headSpec,
            client: config.client,
            tags: [sanitizeGitTag(branchTag)],
            orgId: specDetails.orgId,
          });
        } catch (e) {
          specReport.error = `Failed to upload run to Optic: ${e}`;
          continue;
        }

        ({ specResults, checks, standard, warnings, changelogData } =
          await compute([headSpec, headSpec], config, {
            check: true,
            path,
          }));

        allChecks.push(checks);

        const [_breakingChanges, designIssues] = partitionFailedResults(
          specResults.results
        );
        specReport.designIssues = designIssues;
      }

      results.push({
        groupedDiffs: changelogData,
        warnings,
        name: path,
        specUrl: specUrl ?? '',
        changelogUrl: changelogUrl ?? '',
        results: specResults.results,
      });
    }

    report(options, specReports, branchTag);

    if (options.comment) {
      switch (getProvider()) {
        case 'github': {
          const commenter = await getGitHubCommenter();
          const sha = process.env.GITHUB_SHA!;

          const data = results.map((result) => ({
            warnings: result.warnings,
            groupedDiffs: result.groupedDiffs,
            results: result.results,
            name: result.name ?? 'Unknown comparison',
            specUrl: result.specUrl,
            changelogUrl: result.changelogUrl,
          }));

          await comment(
            await getDataForCi(data, { severity: Severity.Error }),
            commenter,
            sha
          );

          break;
        }
        default: {
          logger.error(
            chalk.red(
              'Optic needs a GITHUB_TOKEN to have permission to post a comment when --comment is set.'
            )
          );
          logger.info(
            chalk.red(
              'The `--comment` option is only available as part of a GitHub action for now. Email us at contact@useoptic.com to request another provider.'
            )
          );
          process.exitCode = 1;
          return;
        }
      }
    }

    const hasFailures = allChecks.some((checks) => checks.failed.error > 0);
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
        specs_without_remote_on_specified_base: options.base
          ? specReports.filter((s) => s.noRemoteSpec).length
          : undefined,
        specs_without_remote_on_default_base: options.base
          ? undefined
          : specReports.filter((s) => s.noRemoteSpec).length,
        exit1,
        webUrl: maybeOrigin?.web_url,
        ...optionsForAnalytics(options),
      },
      config.userId
    );

    await flushEvents();

    if (exit1) process.exitCode = 1;
  };
