import { Command } from 'commander';
import prompts from 'prompts';
import open from 'open';
import path from 'path';
import ora from 'ora';
import { OpticCliConfig, VCS } from '../../config';
import { getFileFromFsOrGit, ParseResult } from '../../utils/spec-loaders';
import { logger } from '../../logger';
import { OPTIC_STANDARD_KEY, OPTIC_URL_KEY } from '../../constants';
import chalk from 'chalk';
import * as GitCandidates from './git-get-file-candidates';
import * as FsCandidates from './get-file-candidates';
import { writeJson, writeYml } from './write-to-file';
import { OpticBackendClient } from '../../client';
import { uploadSpec } from '../../utils/cloud-specs';
import * as Git from '../../utils/git-utils';

import {
  getApiFromOpticUrl,
  getApiUrl,
  getStandardsUrl,
} from '../../utils/cloud-urls';
import { getDefaultRulesetConfig } from './default-ruleset-config';
import {
  flushEvents,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';
import { errorHandler } from '../../error-handler';

function short(sha: string) {
  return sha.slice(0, 8);
}

const usage = () => `
  optic api add
  optic api add <path_to_spec.yml>
  optic api add <path_to_spec.yml> --history-depth 0
  optic api add <path_to_spec.yml> --standard <standard_id> --web`;

const helpText = `
Example usage:
  Add a single api to optic
  $ optic api add <path_to_spec.yml>

  Add a single api to optic and crawl through the history \`depth\` steps. history-depth=0 will crawl the entire history
  $ optic api add <path_to_spec.yml> --history-depth <depth>

  Discover all apis in the current repo
  $ optic api add --all

  Add all apis and attach standard - configure your API standard in Optic cloud
  $ optic api add --standard <standard_id>
  `;

export const registerApiAdd = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('add')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description('Add APIs to Optic')
    .argument(
      '[spec_path]',
      'optional path to file to add, if not set looks at working directory'
    )
    .option(
      '--history-depth <history-depth>',
      'Sets the depth of how far to crawl through to add historic API data. Set history-depth=0 if you want to crawl the entire history',
      '1'
    )
    .option('--all', 'discover all APIs in the current repo')
    .option(
      '--standard <standard>',
      'Set a standard to run on API diffs. You can always add this later by setting the `[x-optic-standard]` key on your OpenAPI spec'
    )
    .option('--web', 'open to the added API in Optic Cloud', false)
    .action(errorHandler(getApiAddAction(config)));
};

type ApiAddActionOptions = {
  historyDepth: string;
  standard?: string;
  web?: boolean;
  all?: boolean;
};

async function getOrganizationToUploadTo(client: OpticBackendClient): Promise<
  | {
      ok: true;
      org: { id: string; name: string };
    }
  | {
      ok: false;
      error: string;
    }
> {
  let org: { id: string; name: string };

  const { organizations } = await client.getTokenOrgs();
  if (organizations.length > 1) {
    const response = await prompts({
      type: 'select',
      name: 'orgId',
      message: 'Select the organization you want to add APIs to',
      choices: organizations.map((org) => ({
        title: org.name,
        value: org.id,
      })),
    });
    org = organizations.find((o) => o.id === response.orgId)!;
  } else if (organizations.length === 0) {
    process.exitCode = 1;
    return {
      ok: false,
      error:
        'Authenticated token was not associated with any organizations. Generate a new token at https://app.useoptic.com',
    };
  } else {
    org = organizations[0];
  }

  return { ok: true, org };
}

async function promptForStandard(
  orgId: string,
  client: OpticBackendClient
): Promise<string | undefined> {
  const existingStandards = await client.getOrgStandards(orgId);

  // if empty, create default without interrupting first time users
  if (existingStandards.length === 0) {
    const standard = await client.createOrgStandard(orgId, [
      { name: 'breaking-changes', config: {} },
    ]);
    return standard.slug;
  }

  const rulesetResponse = await prompts([
    {
      type: 'confirm',
      message:
        'Would you like to attach a standard to any added APIs? Note that you can always add a standard later',
      name: 'add',
      initial: true,
    },
    {
      type: (prev) => (prev && existingStandards.length > 0 ? 'select' : null),
      message:
        "Would you like to use an existing standard or create a new standard using Optic's built in rulesets",
      name: 'useExisting',
      choices: [
        {
          title: 'Use an existing standard',
          value: 'existing',
        },
        {
          title: "Create a new standard using Optic's built in rulesets",
          value: 'new',
        },
      ],
    },
    {
      type: (prev) => (prev === 'existing' ? 'select' : null),
      name: 'standard',
      message: 'Select an existing standard to add to these APIs',
      choices: existingStandards.map((r) => ({
        title: r.slug,
        value: r.slug,
      })),
    },
  ]);

  if (rulesetResponse.standard) {
    return rulesetResponse.standard;
  } else if (rulesetResponse.add && rulesetResponse.useExisting === 'new') {
    const createRulesetResponse = await prompts({
      type: 'multiselect',
      name: 'rulesets',
      min: 1,
      hint: '- Space to select. Return to submit',
      message: 'Select the rulesets you want to add to your standard',
      choices: [
        { title: 'Breaking changes', value: 'breaking-changes' },
        { title: 'Enforce naming conventions', value: 'naming' },
        { title: 'Require examples in schemas', value: 'examples' },
      ],
    });

    if (
      createRulesetResponse.rulesets &&
      createRulesetResponse.rulesets.length > 0
    ) {
      const rulesetsToAdd: string[] = createRulesetResponse.rulesets;
      const rulesetsWithConfig = rulesetsToAdd.map((rulesetName) => ({
        name: rulesetName,
        config: getDefaultRulesetConfig(rulesetName),
      }));
      const standard = await client.createOrgStandard(
        orgId,
        rulesetsWithConfig
      );
      const standardUrl = getStandardsUrl(
        client.getWebBase(),
        orgId,
        standard.id
      );

      logger.info(
        `A new standard has been created. You can view and edit this standard at ${standardUrl}`
      );
      return standard.slug;
    }
  }
}

async function verifyStandardExists(
  standard: string,
  client: OpticBackendClient
): Promise<{ ok: boolean }> {
  try {
    await client.getStandard(standard);
    return { ok: true };
  } catch (e) {
    return { ok: false };
  }
}

async function crawlCandidateSpecs(
  orgId: string,
  [path, shas]: [string, string[]],
  config: OpticCliConfig,
  options: {
    path_to_spec: string | undefined;
    standard: string | undefined;
    web?: boolean;
    default_branch: string;
    web_url?: string;
  }
) {
  let parseResult: ParseResult;
  try {
    parseResult = await getFileFromFsOrGit(path, config, {
      strict: false,
      denormalize: true,
    });
  } catch (e) {
    if (path === options.path_to_spec) {
      logger.info(
        chalk.red(
          `File ${options.path_to_spec} is not a valid OpenAPI file. Optic currently supports OpenAPI 3 and 3.1`
        )
      );
      logger.info(e);
    } else {
      logger.debug(`Disregarding candidate ${path}`);
      logger.debug(e);
    }
    return;
  }
  if (parseResult.isEmptySpec) {
    logger.info(chalk.red(`File ${path} does not exist in working directory`));
    return;
  }

  const spinner = ora(`Found OpenAPI at ${path}`);
  spinner.color = 'blue';

  const existingOpticUrl: string | undefined =
    parseResult.jsonLike[OPTIC_URL_KEY];
  const maybeParsedUrl = existingOpticUrl
    ? getApiFromOpticUrl(existingOpticUrl)
    : null;

  let alreadyTracked = false;

  let api: { id: string; url: string };
  if (existingOpticUrl && maybeParsedUrl) {
    alreadyTracked = true;
    api = { id: maybeParsedUrl.apiId, url: existingOpticUrl };
  } else {
    const name = parseResult.jsonLike?.info?.title ?? path;
    const { id } = await config.client.createApi(orgId, {
      name,
      default_branch: options.default_branch,
      web_url: options.web_url,
    });
    api = {
      id,
      url: getApiUrl(config.client.getWebBase(), orgId, id),
    };
  }

  for await (const sha of shas) {
    let parseResult: ParseResult;
    try {
      parseResult = await getFileFromFsOrGit(`${sha}:${path}`, config, {
        strict: false,
        denormalize: true,
      });
    } catch (e) {
      logger.debug(
        `${short(
          sha
        )}:${path} is not a valid OpenAPI file, skipping sha version`,
        e
      );
      continue;
    }
    if (parseResult.isEmptySpec) {
      logger.debug(
        `File ${path} does not exist in sha ${short(sha)}, stopping here`
      );
      break;
    }
    spinner.text = `${chalk.bold.blue(
      parseResult.jsonLike.info.title || path
    )} version ${sha.substring(0, 6)} uploading`;
    await uploadSpec(api.id, {
      spec: parseResult,
      tags: [`git:${sha}`],
      client: config.client,
      orgId,
    });
  }

  // Write to file only if optic-url is not set or is invalid
  if (!existingOpticUrl || !maybeParsedUrl) {
    if (/.json/i.test(path)) {
      await writeJson(path, {
        [OPTIC_URL_KEY]: api.url,
        ...(options.standard ? { [OPTIC_STANDARD_KEY]: options.standard } : {}),
      });
    } else {
      await writeYml(path, {
        [OPTIC_URL_KEY]: api.url,
        ...(options.standard ? { [OPTIC_STANDARD_KEY]: options.standard } : {}),
      });
    }
    logger.debug(`Added spec ${path} to ${api.url}`);

    trackEvent('api.added', {
      apiId: api.id,
      orgId: orgId,
      url: api.url,
    });

    if (options.web) {
      await open(api.url, { wait: false });
    }
  } else {
    logger.debug(`Spec ${path} has already been added at ${api.url}`);
  }

  spinner.succeed(
    `${chalk.bold.blue(parseResult.jsonLike.info.title || path)} ${
      alreadyTracked ? 'already being tracked' : 'is now being tracked'
    }.\n  ${chalk.bold(`View history: ${chalk.underline(api.url)}`)}`
  );
}

export const getApiAddAction =
  (config: OpticCliConfig) =>
  async (path_to_spec: string | undefined, options: ApiAddActionOptions) => {
    if (isNaN(Number(options.historyDepth))) {
      logger.error(
        chalk.red(
          '--history-depth is not a number. history-depth must be a number'
        )
      );
      process.exitCode = 1;
      return;
    } else if (!path_to_spec && !options.all) {
      logger.error(
        chalk.red(
          'No spec path provided. Run "optic api add /path/to/spec.yml" or use the "optic api add --all" flag'
        )
      );
      process.exitCode = 1;
      return;
    } else if (path_to_spec && options.all) {
      logger.error(
        chalk.red(
          'The spec path and the "--all" flag were both provided. Use one or the other.'
        )
      );
      process.exitCode = 1;
      return;
    } else if (!path_to_spec && options.historyDepth !== '1') {
      logger.error(
        chalk.red(
          'Invalid argument combination: Cannot set a history-depth !== 1 when no spec path is provided'
        )
      );
      process.exitCode = 1;
      return;
    } else if (!config.isAuthenticated) {
      logger.error(
        chalk.red(
          'You must be logged in to add APIs to Optic Cloud. Please run "optic login"'
        )
      );
      process.exitCode = 1;
      return;
    }

    const orgRes = await getOrganizationToUploadTo(config.client);
    if (!orgRes.ok) {
      logger.error(orgRes.error);
      process.exitCode = 1;
      return;
    }
    logger.info('');

    let standard = options.standard;
    if (!standard) {
      standard = await promptForStandard(orgRes.org.id, config.client);
    } else {
      const results = await verifyStandardExists(standard, config.client);
      if (!results.ok) {
        logger.warn(
          chalk.yellow(
            `Warning: It looks like the standard ${standard} does not exist.`
          )
        );
      }
    }

    let default_branch: string = '';
    let web_url: string | undefined = undefined;

    logger.info('');

    if (config.vcs && config.vcs?.type === VCS.Git) {
      const maybeDefaultBranch = await Git.getDefaultBranchName();
      if (maybeDefaultBranch) {
        default_branch = maybeDefaultBranch;
      }
      const maybeOrigin = await Git.guessRemoteOrigin();
      if (maybeOrigin) {
        web_url = maybeOrigin.web_url;
      } else {
        logger.info(
          chalk.red(
            'Could not parse git origin details for where this repository lives.'
          )
        );
        const results = await prompts([
          {
            message:
              'Do you want to enter the origin details manually? This will help optic link your specs back to your git hosting provider',
            type: 'confirm',

            name: 'add',
            initial: true,
          },
          {
            type: (prev) => (prev ? 'text' : null),
            message:
              'Enter the web url where this API is uploaded (example: https://github.com/opticdev/optic)',
            name: 'webUrl',
          },
        ]);
        if (results.webUrl) {
          web_url = results.webUrl;
        }
        logger.info('');
      }

      logger.info(
        chalk.bold.gray(
          path_to_spec
            ? `Adding API ${path_to_spec}`
            : `Looking for OpenAPI specs in the git root (${config.root})`
        )
      );
    } else {
      logger.info(
        chalk.bold.gray(
          path_to_spec
            ? `Adding API ${path_to_spec}`
            : `Looking for OpenAPI specs in the current directory (${process.cwd()})`
        )
      );
    }

    let candidates: Map<string, string[]>;

    if (config.vcs?.type === VCS.Git) {
      candidates = path_to_spec
        ? await GitCandidates.getShasCandidatesForPath(
            path_to_spec,
            options.historyDepth
          )
        : await GitCandidates.getPathCandidatesForSha(config.vcs.sha);
    } else {
      const files = path_to_spec
        ? [path.resolve(path_to_spec)]
        : await FsCandidates.getFileCandidates();

      candidates = new Map(files.map((f) => [f, []]));
    }

    for await (const candidate of candidates) {
      await crawlCandidateSpecs(orgRes.org.id, candidate, config, {
        path_to_spec,
        standard,
        web: options.web,
        default_branch,
        web_url,
      });
    }
    await flushEvents();
  };
