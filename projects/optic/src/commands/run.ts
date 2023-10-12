import { Command, Option } from 'commander';
import prompts from 'prompts';
import path from 'path';
import { ConfigRuleset, OpticCliConfig, readUserConfig, VCS } from '../config';
import { errorHandler } from '../error-handler';
import { logger } from '../logger';
import { getApiFromOpticUrl, getNewTokenUrl } from '../utils/cloud-urls';
import open from 'open';
import { handleTokenInput, identifyLoginFromToken } from './login/login';
import { matchSpecCandidates } from './diff/diff-all';
import {
  checkIgnore,
  getCurrentBranchName,
  guessRemoteOrigin,
} from '../utils/git-utils';
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
import { flushEvents, trackEvent, identify } from '../segment';
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
import { resolveRelativePath } from '../utils/capture';
import { GroupedCaptures } from './capture/interactions/grouped-interactions';
import { getCaptureStorage } from './capture/storage';
import { captureRequestsFromProxy } from './capture/actions/captureRequests';
import { processCaptures } from './capture/capture';
import { uploadCoverage } from './capture/actions/upload-coverage';

const usage = () => `
  To see how Optic handles changes, run Optic in your repository a first time; then make
  changes to one or more of your OpenAPI files and run again:

  $ optic run

  Visit https://www.useoptic.com/docs/setup-ci for CI setup instructions.
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

export function registerRunCommand(cli: Command, config: OpticCliConfig) {
  cli
    .command('run')
    .description(
      `Optic's CI workflow command.
Tests that every OpenAPI specification in your repo is accurate, has no breaking changes and follows the standards you defined in the optic.yml file;
then posts a comment with a report to your PR/MR and exits with code 1 when issues are found.`
    )
    .configureHelp({ commandUsage: usage })
    .option(
      '--ignore <ignore-glob>',
      'OpenAPI specification files to ignore, comma separated globs.'
    )
    .option(
      '--include-git-ignored',
      'Set to true to also match Git ignored files.',
      false
    )
    .addOption(
      new Option(
        '--severity <severity>',
        'Set to "none" to prevent Optic from exiting 1 when issues are found.'
      )
        .choices(severities)
        .default('error')
    )
    .argument(
      '[file_paths]',
      'OpenAPI specification files to handle, comma separated globs. Leave empty to match all non-ignored OpenAPI files in your repository.'
    )
    .action(errorHandler(getRunAction(config), { command: 'run' }));
}

type RunActionOptions = {
  ignore?: string;
  severity: (typeof severities)[number];
  includeGitIgnored: boolean;
};

async function authenticateInteractive(config: OpticCliConfig) {
  const userConfig = await readUserConfig();
  if (userConfig?.token) {
    try {
      await identifyLoginFromToken(userConfig.token);
    } catch (e) {}
    return true;
  }

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
    : token;

  trackEvent('cli.login');
  await flushEvents();

  return true;
}

async function authenticateCI(config: OpticCliConfig) {
  if (config.userId) identify(config.userId);
  return config.isAuthenticated;
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

type DiffResult = {
  warnings: string[];
  groupedDiffs: GroupedDiffs;
  results: RuleResult[];
  name: string;
  specUrl: string;
  changelogUrl: string;
};

type SpecReport = {
  path: string;
  title?: string;
  error?: string;
  diff?:
    | { success: false; error: string }
    | {
        diffResult?: DiffResult;
        checks?: Awaited<ReturnType<typeof compute>>['checks'];
        success: true;
        breakingChanges?: number;
        designIssues?: number;
        changelogLink?: string;
        diffs?: number;
        endpoints?: {
          added: number;
          removed: number;
          changed: number;
        };
      };
  capture?:
    | {
        bufferedOutput: string[];
        unmatchedInteractions: number;
        hasAnyDiffs: boolean;
        coverage: string;
        success: true;
      }
    | {
        success: false;
        error: string;
      };
};

function reportDiff(report: SpecReport) {
  const diffReport = report.diff;
  if (!diffReport) return;
  if (!diffReport.success) {
    logger.info(`| Optic run failed to diff:`);
    logger.info(`| ${diffReport.error}`);
    logger.info('|');
    return;
  }
  const breakingChangesReport = !diffReport.diffs
    ? '☑️  No changes '
    : diffReport.breakingChanges
    ? `❌ ${diffReport.breakingChanges} breaking change${
        diffReport.breakingChanges > 1 ? 's' : ''
      } `
    : '✅ No breaking changes ';

  const designReport = diffReport.designIssues
    ? `❌ ${diffReport.designIssues} design issue${
        diffReport.designIssues > 1 ? 's' : ''
      } `
    : '✅ Design ';

  logger.info(`| ${breakingChangesReport}${designReport}`);

  if (diffReport.changelogLink) {
    logger.info(`| View report: ${diffReport.changelogLink}`);
  }
  logger.info('|');
}

function reportCapture(report: SpecReport) {
  const captureReport = report.capture;
  if (!captureReport) {
    logger.info(
      `| Skipping API test verification (set up by running \`optic capture init ${report.path}\`)`
    );
    return;
  } else if (captureReport.success) {
    const { bufferedOutput, coverage } = captureReport;
    logger.info(`| API Test Coverage Report (${coverage}% coverage)`);
    bufferedOutput.forEach((output) => {
      logger.info(`| ` + output);
    });
  } else {
    if (captureReport) {
      logger.info(`| API test verification failed to run`);
      logger.info(`| ${captureReport.error}`);
    } else {
    }
  }
}

function reportSpec(report: SpecReport) {
  logger.info(`| ${chalk.bold(report.title)} (${report.path})`);

  if (report.error) {
    logger.info(`| Diff failed:`);
    logger.info(`| ${report.error}`);
    return;
  }
  reportDiff(report);
  reportCapture(report);
  logger.info('');
}

const optionsForAnalytics = (options: RunActionOptions) => ({
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

const runDiffs = async ({
  specPath,
  cloudTag,
  config,
  localSpec,
  currentBranch,
  specDetails,
}: {
  specPath: string;
  cloudTag: string;
  config: OpticCliConfig;
  localSpec: ParseResult;
  currentBranch: string;
  specDetails: Exclude<ReturnType<typeof getApiFromOpticUrl>, null>;
}) => {
  let specResults: CompareSpecResults,
    warnings: string[],
    checks: any,
    standard: ConfigRuleset[],
    changelogData: GroupedDiffs,
    changelogUrl: string | undefined,
    specUrl: string | undefined;

  let cloudSpec: ParseResult | undefined = undefined;
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
    return {
      success: false,
      error: `Failed to load cloud specification: ${e}`,
    };
  }

  if (cloudSpec.jsonLike['x-optic-ci-empty-spec']) {
    cloudSpec.jsonLike.info.title = localSpec.jsonLike.info.title;
    cloudSpec.jsonLike.info.version = localSpec.jsonLike.info.version;
    cloudSpec.jsonLike.openapi = localSpec.jsonLike.openapi;
  }

  let computeResults: Awaited<ReturnType<typeof compute>>;

  try {
    computeResults = await compute([cloudSpec, localSpec], config, {
      check: true,
      path: specPath,
    });
  } catch (e) {
    return {
      success: false,
      error: `Run failed to compute diffs: ${e}`,
    };
  }

  ({ specResults, standard, checks, changelogData, warnings } = computeResults);

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
    return {
      success: false,
      error: `Failed to upload run to Optic: ${e}`,
    };
  }
  const diffReport: SpecReport['diff'] = { success: true };
  diffReport.diffs = specResults.diffs.length;
  diffReport.changelogLink = upload?.changelogUrl;

  const [breakingChanges, designIssues] = partitionFailedResults(
    specResults.results
  );

  diffReport.designIssues = designIssues;
  diffReport.breakingChanges = breakingChanges;
  diffReport.checks = checks;
  diffReport.diffResult = {
    groupedDiffs: changelogData,
    warnings,
    name: specPath,
    specUrl: specUrl ?? '',
    changelogUrl: changelogUrl ?? '',
    results: specResults.results,
  };

  return diffReport;
};

const runCapture = async ({
  specPath,
  config,
  localSpec,
  specDetails,
}: {
  specPath: string;
  config: OpticCliConfig;
  localSpec: ParseResult;
  specDetails: Exclude<ReturnType<typeof getApiFromOpticUrl>, null>;
}): Promise<SpecReport['capture']> => {
  const pathFromRoot = resolveRelativePath(config.root, specPath);
  const captureConfig = config.capture?.[pathFromRoot];

  if (captureConfig) {
    const trafficDirectory = await getCaptureStorage(path.resolve(specPath));
    const captures = new GroupedCaptures(trafficDirectory, localSpec.jsonLike);

    let harEntries: any;
    try {
      harEntries = await captureRequestsFromProxy(config, captureConfig, {
        serverUrl: captureConfig.server.url,
        disableSpinner: true,
      });
    } catch (e) {
      return {
        success: false,
        error: `Run failed to capture: ${e}`,
      };
    }

    if (!harEntries) {
      return {
        success: false,
        error: `Run failed: no har entries were captured`,
      };
    }

    for await (const har of harEntries) {
      captures.addHar(har);
      logger.debug(
        `Captured ${har.request.method.toUpperCase()} ${har.request.url}`
      );
    }
    const captureResults = await processCaptures(
      {
        captureConfig,
        cliConfig: config,
        captures,
        spec: localSpec,
        filePath: specPath,
      },
      {
        bufferLogs: true,
        verbose: false,
      }
    );
    if (!captureResults.success) {
      return {
        success: false,
        error: captureResults.bufferedOutput.join('\n| '),
      };
    }
    const { unmatchedInteractions, hasAnyDiffs, coverage, bufferedOutput } =
      captureResults;

    try {
      await uploadCoverage(localSpec, coverage, specDetails, config);
    } catch (e) {
      return {
        success: false,
        error: `Run failed to upload coverage: ${e}`,
      };
    }

    return {
      bufferedOutput,
      coverage: String(coverage.calculateCoverage().percent),
      unmatchedInteractions,
      hasAnyDiffs,
      success: true,
    };
  }
};

export const getRunAction =
  (config: OpticCliConfig) =>
  async (matchArg: string | undefined, options: RunActionOptions) => {
    const commentToken =
      process.env.GITHUB_TOKEN ?? process.env.OPTIC_GITLAB_TOKEN;

    const baseBranch =
      process.env.GITHUB_BASE_REF ??
      process.env.CI_MERGE_REQUEST_TARGET_BRANCH_NAME;

    const isPR = config.isInCi && !!baseBranch;

    const maybeOrigin =
      config.vcs?.type === VCS.Git ? await guessRemoteOrigin() : null;

    trackEvent(
      'optic.run.init',
      {
        isInCi: config.isInCi,
        isAuthenticated: !!config.isAuthenticated,
        commentToken: !!commentToken,
        isPR,
        webUrl: maybeOrigin?.web_url,
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

    const match = matchArg ?? `**/*.(json|yml|yaml)`;
    let localSpecPathsUnchecked = await matchSpecCandidates(
      match,
      options.ignore
    );

    if (!options.includeGitIgnored)
      localSpecPathsUnchecked = await excludeGitIgnored(
        localSpecPathsUnchecked
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
          matchArg || options.ignore ? ` that matches your filters` : ''
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
    logger.info(`${localSpecPaths.join(', ')}\n`);

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

 [1]: \`${cloudTag}\`
 [2]: \`${currentBranchCloudTag}\`

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

    for (const [specPath, opticUrl] of pathUrls.entries()) {
      let localSpec: ParseResult;
      try {
        localSpec = await loadSpec(specPath, config, {
          strict: true,
          denormalize: true,
        });
      } catch (e) {
        const specReport = {
          error: `Invalid specification: ${e}`,
          path: specPath,
        };
        reportSpec(specReport);
        continue;
      }

      let specDetails: ReturnType<typeof getApiFromOpticUrl>;
      try {
        specDetails = getApiFromOpticUrl(opticUrl);
      } catch (e) {
        const specReport = {
          error: `Failed to load specification from Optic: ${e}`,
          path: specPath,
        };
        reportSpec(specReport);
        continue;
      }
      if (!specDetails) {
        const specReport = {
          error: `Could not load specification form Optic ${opticUrl}`,
          path: specPath,
        };
        reportSpec(specReport);
        continue;
      }

      const diffsReport = await runDiffs({
        cloudTag,
        config,
        currentBranch,
        localSpec,
        specDetails,
        specPath,
      });

      const captureReport = await runCapture({
        config,
        localSpec,
        specDetails,
        specPath,
      });

      const specReport = {
        path: specPath,
        title: localSpec.jsonLike.info.title,
        diff: diffsReport,
        capture: captureReport,
      };

      specReports.push(specReport);
      reportSpec(specReport);
    }

    if (commentToken && isPR) {
      const data = specReports
        .map((report) => {
          const result = report?.diff?.success
            ? report.diff.diffResult
            : undefined;
          if (!result) return null;
          return {
            warnings: result.warnings,
            groupedDiffs: result.groupedDiffs,
            results: result.results,
            name: result.name ?? 'Unknown comparison',
            specUrl: result.specUrl,
            changelogUrl: result.changelogUrl,
          };
        })
        .filter((r: DiffResult | null): r is DiffResult => !!r);

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
      specReports.some(
        (r) => !r.diff?.success || (r.diff.checks?.failed.error ?? 0) > 0
      ) ||
      specReports.some((r) => {
        if (!r.capture) return false;
        const captureFailedToRun = !r.capture.success;
        const captureHasMismatch =
          r.capture.success &&
          (r.capture.unmatchedInteractions > 0 || r.capture.hasAnyDiffs);
        return captureFailedToRun || captureHasMismatch;
      });

    const exit1 = options.severity === 'error' && hasFailures;

    if (exit1) {
      logger.info('');
      logger.info(
        'Errors were found: exiting with code 1. Disable this behaviour with the `--severity none` option.'
      );
      process.exitCode = 1;
    }

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

    trackEvent(
      'optic.run.complete',
      {
        isInCi: config.isInCi,
        specs: localSpecPaths.length,
        failed_specs: specReports.filter(
          (s) => !s.diff?.success || s.capture?.success === false
        ).length,
        spec_with_design_issues: specReports.filter(
          (s) => s.diff?.success && s.diff?.designIssues
        ).length,
        spec_with_breaking_changes: specReports.filter(
          (s) => s.diff?.success && s.diff.breakingChanges
        ).length,
        exit1,
        webUrl: maybeOrigin?.web_url,
        ...optionsForAnalytics(options),
      },
      config.userId
    );

    await flushEvents();
  };

async function excludeGitIgnored(filepaths: string[]): Promise<string[]> {
  const ignored = new Set(await checkIgnore(filepaths));
  return filepaths.filter((p) => !ignored.has(p));
}
