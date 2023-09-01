import { Command } from 'commander';
import prompts from 'prompts';
import { OpticCliConfig, readUserConfig, VCS } from '../config';
import { errorHandler } from '../error-handler';
import { logger } from '../logger';
import { getApiFromOpticUrl, getNewTokenUrl } from '../utils/cloud-urls';
import open from 'open';
import { handleTokenInput } from './login/login';
import { matchSpecCandidates } from './diff/diff-all';
import { getCurrentBranchName } from '../utils/git-utils';
import { loadSpec, loadRaw } from '../utils/spec-loaders';
import type { ParseResult } from '../utils/spec-loaders';
import { OPTIC_URL_KEY } from '../constants';
import { checkOpenAPIVersion } from '@useoptic/openapi-io';
import { getDetailsForGeneration } from '../utils/generated';
import path from 'path';
import { OpenAPIV3, sanitizeGitTag } from '@useoptic/openapi-utilities';
import * as Types from '../client/optic-backend-types';
import chunk from 'lodash.chunk';
import { getApiUrl } from '../utils/cloud-urls';
import { compute } from './diff/compute';
import { uploadDiff } from './diff/upload-diff';
import { uploadSpec } from '../utils/cloud-specs';
import chalk from 'chalk';
import { trackEvent } from '../segment';

const usage = () => `
  optic run
`;

const helpText = `


Example usage:
  Run:
  $ optic run
`;

export function registerRunCommand(cli: Command, config: OpticCliConfig) {
  cli
    .command('run')
    .configureHelp({ commandUsage: usage })
    .addHelpText('after', helpText)
    .option(
      '--match <match-glob>',
      'Filter local OpenAPI specifications files with this glob pattern.'
    )
    .option(
      '--ignore <ignore-glob>',
      'Ignore local OpenAPI specifications files with this glob pattern.'
    )
    .option(
      '--base <base-comparison-tag>',
      'Specify a cloud tag to compare local versions of your OpenAPI specs against. E.g. "gitbranch:main". If unspecified, Optic compare your specs against the latest cloud version if finds tagged with `girbranch:<current-branch>`.'
    )
    .action(errorHandler(getRunAction(config), { command: 'run' }));
}

type RunActionOptions = {
  match?: string;
  ignore?: string;
  base?: string;
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
            title: 'Paste a token',
            value: 'paste',
          },
          {
            title: 'Get a token on app.useoptic.com',
            value: 'get',
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
        if (answer === 'get') open(getNewTokenUrl(config.client.getWebBase()));
      },
    }
  );

  if (!token) {
    return false;
  }

  trackEvent(
    'optic.run.token_pasted',
    {
      isInCi: config.isInCi,
    },
    config.userId
  );

  await handleTokenInput(token);
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
      console.log('error loading raw', e);
      continue; // TODO: handle failures
    }

    try {
      checkOpenAPIVersion(rawSpec);
    } catch (e) {
      console.log('error api version', e);
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
  issues?: number;
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

// TODO: run lint even the first time a spec is pushed
function report(
  options: RunActionOptions,
  specReports: SpecReport[],
  branchTag: string
) {
  for (const report of specReports) {
    logger.info(`| ${chalk.bold(report.title)} (${report.path})`);
    if (report.error) {
      logger.warn(`| Optic encountered an error: ${report.error}`);
    } else if (report.noRemoteSpec) {
      if (options.base) {
        logger.warn(
          '| No cloud spec with specified base tag was found to compare local spec against.'
        );
      } else {
        logger.info(
          `| First version pushed on Optic cloud with \`${branchTag}\` tag. Make changes to your spec and run again to see Optic diff your spec with this latest uploaded version.`
        );
      }
    } else {
      logger.info(
        (report.issues ?? 0) > 0
          ? `| ❌ ${report.issues} issue${report.issues! > 1 ? 's' : ''} ${
              report.issues! > 1 ? 'were' : 'was'
            } found.`
          : `| ✅ all checks passed.`
      );
      logger.info(`| View report: ${chalk.blue(report.changelogLink)}.`);
    }
    logger.info('');
  }
}

export const getRunAction =
  (config: OpticCliConfig) => async (options: RunActionOptions) => {
    trackEvent(
      'optic.run',
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

    const specReports: SpecReport[] = [];
    const pathUrls = await identifyOrCreateApis(config, localSpecPaths);

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
        const { specResults, /* checks, changelogData, warnings, */ standard } =
          await compute([baseSpec, headSpec], config, {
            standard: undefined, // TODO
            check: true,
            path,
          });

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
        specReport.issues = specResults.results.length;
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
      }
    }

    report(options, specReports, branchTag);

    trackEvent(
      'optic.run.complete',
      {
        isInCi: config.isInCi,
        specs: localSpecPaths.length,
        failed_specs: specReports.filter((s) => s.error).length,
        spec_with_design_issues: specReports.filter((s) => s.issues).length,
        specs_without_remote_on_specified_base: options.base
          ? specReports.filter((s) => s.noRemoteSpec).length
          : undefined,
      },
      config.userId
    );
  };
