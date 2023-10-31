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
  getOperationsChangedLabel,
  RuleResult,
  Severity,
} from '@useoptic/openapi-utilities';
import { compute } from './diff/compute';
import { uploadDiff } from './diff/upload-diff';
import chalk from 'chalk';
import { flushEvents, trackEvent, identify } from '../segment';
import { createOpticClient } from '../client/optic-backend';
import fs from 'fs';
import {
  CommentApi,
  GithubCommenter,
  GitlabCommenter,
} from './ci/comment/comment-api';
import { CaptureForCI, CiRunDetails, getDataForCi } from '../utils/ci-data';
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
      '-i, --ignore <glob_pattern,...>',
      'Glob patterns matching OpenAPI specifications to ignore'
    )
    .addOption(
      new Option(
        '-I, --include-git-ignored <bool>',
        'Include specifications matched in .gitignore'
      )
        .choices(['true', 'false'])
        .default('false')
    )
    .addOption(
      new Option(
        '-s, --severity <severity>',
        'Control the exit code when there are issues: error=1, none=0'
      )
        .choices(severities)
        .default('error')
    )
    .argument(
      '[file_paths]',
      'OpenAPI specifications to process, comma separated globs. Leave empty to match all non-ignored OpenAPI files in your repository'
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
        runId?: string;
        diffResult?: DiffResult;
        checks?: Awaited<ReturnType<typeof compute>>['checks'];
        success: true;
        changelogLink?: string;
        diffs?: number;
        endpoints?: {
          added: number;
          removed: number;
          changed: number;
        };
      };
  capture?: Awaited<ReturnType<typeof runCapture>>;
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

  const results = diffReport.diffResult?.results ?? [];
  const failingResults = results.filter((r) => !r.passed && !r.exempted);

  if (diffReport.diffResult?.groupedDiffs) {
    logger.info(
      `| Changes: ${
        getOperationsChangedLabel(diffReport.diffResult?.groupedDiffs) ||
        'No operation changed'
      }`
    );
  }

  const rulesReport = failingResults.length
    ? `⚠️  ${failingResults.length}/${results?.length} failed`
    : `✅ ${results.length}/${results.length} passed`;

  logger.info(`| Rules:   ${rulesReport}`);
}

function reportCapture(report: SpecReport) {
  const capture = report.capture;

  if (!capture) {
    logger.info(
      `| Tests:   Set up API contract testing for this spec: https://www.useoptic.com/docs/verify-openapi`
    );
    return;
  }

  if (!capture.success) {
    logger.info(`| Tests:   ❌ Failed to run`);
    return;
  }

  const { hasAnyDiffs, unmatchedInteractions, coverage } = capture;
  const passed = !hasAnyDiffs && !unmatchedInteractions;

  if (passed) {
    logger.info(
      `| Tests:   ✅ ${Math.round(
        Number(coverage.calculateCoverage().percent)
      )}% coverage`
    );
  } else {
    const { unmatchedInteractions, mismatchedEndpoints } = capture;

    const undocumentedChunk = unmatchedInteractions
      ? `🆕 ${unmatchedInteractions} undocumented path${
          unmatchedInteractions > 1 ? 's' : ''
        }`
      : '';

    const mismatchedChunk = mismatchedEndpoints
      ? `⚠️  ${mismatchedEndpoints} mismatch${
          mismatchedEndpoints > 1 ? 'es' : ''
        }`
      : '';

    logger.info(
      `| Tests:   ${[undocumentedChunk, mismatchedChunk]
        .filter(Boolean)
        .join(' ')}`
    );
  }
}

function reportSpec(report: SpecReport) {
  logger.info(`| ${chalk.bold(report.title)} [${report.path}]`);

  if (report.error) {
    logger.info(`| Diff failed:`);
    logger.info(`| ${report.error}`);
    return;
  }

  if (report.diff?.success && report.diff.changelogLink) {
    logger.info(`| Report:  👁️  ${report.diff.changelogLink}`);
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
    } as const;
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
    } as const;
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
    } as const;
  }
  const diffReport: SpecReport['diff'] = {
    success: true,
    diffs: specResults.diffs.length,
    changelogLink: upload?.changelogUrl,
    runId: upload?.runId,
    checks,
  };

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
  runId,
  organizationId,
}: {
  specPath: string;
  config: OpticCliConfig;
  localSpec: ParseResult;
  specDetails: Exclude<ReturnType<typeof getApiFromOpticUrl>, null>;
  runId?: string;
  organizationId?: string;
}) => {
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
        bufferedOutput: [`Run failed to capture: ${e}`],
      } as const;
    }

    if (!harEntries) {
      return {
        success: false,
        bufferedOutput: [`Run failed: no har entries were captured`],
      } as const;
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

    if (runId && organizationId) {
      try {
        const captureData = captureResults.success
          ? ({
              run_id: runId,
              organization_id: organizationId,
              unmatched_interactions: captureResults.unmatchedInteractions,
              total_interactions: captureResults.totalInteractions,
              percent_covered: Math.round(
                Number(captureResults.coverage.calculateCoverage().percent)
              ),
              endpoints_added: captureResults.endpointsAdded,
              endpoints_matched: captureResults.endpointCounts.matched,
              endpoints_unmatched: captureResults.endpointCounts.unmatched,
              endpoints_total: captureResults.endpointCounts.total,
              has_any_diffs: captureResults.hasAnyDiffs,
              mismatched_endpoints: captureResults.mismatchedEndpoints,
              success: true,
            } as const)
          : ({ success: false } as const);
        await config.client.createCapture(captureData);
      } catch (e) {}
    }

    if (captureResults.success) {
      try {
        await uploadCoverage(
          localSpec,
          captureResults.coverage,
          specDetails,
          config,
          { runId }
        );
      } catch (e) {
        return {
          success: false,
          bufferedOutput: [`Run failed to upload coverage: ${e}`],
        } as const;
      }
    }

    return captureResults;
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
      try {
        localSpecPathsUnchecked = await excludeGitIgnored(
          localSpecPathsUnchecked
        );
      } catch (e) {}

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

 [1]: \`${cloudTag}\` tag
 [2]: \`${currentBranchCloudTag}\` tag

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
        specPath,
        specDetails,
        runId: diffsReport.success ? diffsReport.runId : undefined,
        organizationId: generatedDetails.organization_id,
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

          const captureData: CaptureForCI | undefined = report.capture
            ? report.capture?.success
              ? {
                  success: true,
                  unmatchedInteractions: report.capture.unmatchedInteractions,
                  percentCovered: Math.round(
                    Number(report.capture.coverage.calculateCoverage().percent)
                  ),
                  mismatchedEndpoints: report.capture.mismatchedEndpoints,
                }
              : { success: false }
            : undefined;

          return {
            warnings: result.warnings,
            groupedDiffs: result.groupedDiffs,
            results: result.results,
            name: result.name ?? 'Unknown comparison',
            specUrl: result.specUrl,
            changelogUrl: result.changelogUrl,
            capture: captureData,
          };
        })
        .filter(
          (
            r: DiffResult | null
          ): r is DiffResult & { capture: CaptureForCI | undefined } => !!r
        );

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
