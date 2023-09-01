import { Command, Option } from 'commander';
import prompts from 'prompts';
import { OpticCliConfig, readUserConfig, VCS } from '../config';
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
  OpenAPIV3,
  RuleResult,
  sanitizeGitTag,
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

const usage = () => `
  optic run
  optic run --match *.spec.yml --ignore irrelevant.spec.yml --base gitbranch:main`;

const helpText = `
Run this \`optic run\` locally and in your CI and start shipping better APIs:
- prevent shipping unintentional breaking changes
- enforce API design, including Spectral rules and forwards-only governance
- ensure that your API specifications and implementations match
- get automated cloud reports: stats, API changelogs, documentation time travel and more

Typical CI setup:
- run: \`optic run --base gitbranch:<target-branch>\` when pushing to a PR branch to compare the branch versions with the target branch ones.
- run \`optic run\` when merging on main to upload the newest \`gitbranch:main\` cloud version.

Authentication:
- Use a personal access token for local runs. Optic will give you a link to grab one on app.useoptic.com and ask you to paste it.
- In CI, prefer an organization token: \`OPTIC_TOKEN=<org-token> optic run\`. Get one from the "tokens" tab in app.useoptic.com.

How \`optic run\` works internally:
- the \`run\` command first identifies OpenAPI specification files in your repository using --match and --ignore.
- it then searches for the latest cloud uploaded version of each specification to compare it against: tagged with the specified --base tag, or with \`gitbranch:<current-branch>\` if no --base tag is specified.
- next Optic checks for breaking changes, design issues and implementation mismatches and reports in the console. By default Optic will exit 1 to fail your CI in case issues are detected.
- next the command uploads the latest local specification versions and run reports to your Optic cloud account with the tag \`gitbranch:<current-branch>\`.`;

const severities = ['none', 'error'] as const;

// TODO:
// - add comment
// - add capture
// - fix broken redirection create account -> new token
// - check userId analytics
export function registerRunCommand(cli: Command, config: OpticCliConfig) {
  cli
    .command('run')
    .addHelpText('after', helpText)
    .configureHelp({ commandUsage: usage })
    .description(
      'Run the Optic suite on your OpenAPI specification files and start shipping better APIs.'
    )
    .option(
      '--match <match-glob>',
      'Select local OpenAPI specifications files to handle with this comma separated glob patterns list.'
    )
    .option(
      '--ignore <ignore-glob>',
      'Select local OpenAPI specifications files to ignore with this comma separated glob patterns list.'
    )
    .option(
      '--base <base-comparison-tag>',
      'Specify a cloud tag to compare local versions of your OpenAPI specs against. E.g. "gitbranch:main". If unspecified, Optic compare your specs against the latest cloud version if finds tagged with `gitbranch:<currently-checked-out-branch>`.'
    )
    .addOption(
      new Option(
        '--severity <severity>',
        'Specify the severity level to exit with exit code when issues are found. `--severity none` will prevent Optic from exiting 1 when issues are encountered in your specification files.'
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
};

async function authenticateIT(config: OpticCliConfig) {
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

export const getRunAction =
  (config: OpticCliConfig) => async (options: RunActionOptions) => {
    trackEvent(
      'optic.run.init',
      {
        isInCi: config.isInCi,
      },
      config.userId
    );

    if (config.vcs?.type !== VCS.Git) {
      const error = `Error: optic must be called from a git repository.`;
      logger.error(error);
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
      : await authenticateIT(config);

    if (!authentified) {
      logger.error('A valid Optic token is required to run this command.');
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
    const branch = await getCurrentBranchName();
    const branchTag = `gitbranch:${branch}`;
    const baseTag = options.base ?? branchTag;

    logger.info(
      `Optic found ${localSpecPaths.length} OpenAPI specification files to handle.`
    );
    logger.info(
      `Your local specifications will be compared to their latest uploaded versions on tag \`${baseTag}\`, then uploaded with the current branch tag: \`${branchTag}\`.\n`
    );

    const specReports: SpecReport[] = [];
    const pathUrls = await identifyOrCreateApis(config, localSpecPaths);
    const allChecks: Awaited<ReturnType<typeof compute>>['checks'][] = [];

    for (const [path, opticUrl] of pathUrls.entries()) {
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
        const { specResults, standard, checks } = await compute(
          [baseSpec, headSpec],
          config,
          {
            check: true,
            path,
          }
        );

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

        const { specResults, checks } = await compute(
          [headSpec, headSpec],
          config,
          {
            check: true,
            path,
          }
        );

        allChecks.push(checks);

        const [_breakingChanges, designIssues] = partitionFailedResults(
          specResults.results
        );
        specReport.designIssues = designIssues;
      }
    }

    report(options, specReports, branchTag);

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
      },
      config.userId
    );

    await flushEvents();

    if (exit1) process.exitCode = 1;
  };
