import { Command } from 'commander';
import prompts from 'prompts';
import open from 'open';
import path from 'path';
import fs from 'node:fs/promises';
import ora from 'ora';
import { OpticCliConfig, VCS } from '../../config';
import { getFileFromFsOrGit, ParseResult } from '../../utils/spec-loaders';
import { logger } from '../../logger';
import { OPTIC_URL_KEY } from '../../constants';
import chalk from 'chalk';
import * as GitCandidates from './git-get-file-candidates';
import * as FsCandidates from './get-file-candidates';
import { writeJson, writeYml } from './write-to-file';
import { uploadSpec } from '../../utils/cloud-specs';
import * as Git from '../../utils/git-utils';

import { getApiFromOpticUrl, getApiUrl } from '../../utils/cloud-urls';
import {
  flushEvents,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';
import { errorHandler } from '../../error-handler';
import { getOrganizationFromToken } from '../../utils/organization';

function short(sha: string) {
  return sha.slice(0, 8);
}

const usage = () => `
  optic api add .
  optic api add ./folder
  optic api add <path_to_spec.yml> --history-depth 0
  optic api add <path_to_spec.yml> --web`;

const helpText = `
Example usage:
  Add a single api to optic
  $ optic api add <path_to_spec.yml>

  Add a single api to optic and crawl through the history \`depth\` steps. history-depth=0 will crawl the entire history
  $ optic api add <path_to_spec.yml> --history-depth <depth>

  Discover all apis in the current repo
  $ optic api add .

  `;

export const registerApiAdd = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('add')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description('Add APIs to Optic')
    .argument('[path_to_spec]', 'path to file or directory to add')
    .option(
      '--history-depth <history-depth>',
      'Sets the depth of how far to crawl through to add historic API data. Set history-depth=0 if you want to crawl the entire history',
      '1'
    )
    .option('--all', 'add all', false)
    .option('--web', 'open to the added API in Optic Cloud', false)
    .action(errorHandler(getApiAddAction(config)));
};

type ApiAddActionOptions = {
  historyDepth: string;
  web: boolean;
  all: boolean;
};

async function crawlCandidateSpecs(
  orgId: string,
  [file_path, shas]: [string, string[]],
  config: OpticCliConfig,
  options: {
    path_to_spec: string | undefined;
    web?: boolean;
    default_branch: string;
    default_tag?: string | undefined;
    web_url?: string;
  }
) {
  const pathRelativeToRoot = path.relative(config.root, file_path);
  let parseResult: ParseResult;
  try {
    parseResult = await getFileFromFsOrGit(file_path, config, {
      strict: false,
      denormalize: true,
    });
  } catch (e) {
    if (file_path === options.path_to_spec) {
      logger.info(
        chalk.red(
          `File ${options.path_to_spec} is not a valid OpenAPI file. Optic currently supports OpenAPI 3 and 3.1`
        )
      );
      logger.info(e);
    } else {
      logger.debug(`Disregarding candidate ${pathRelativeToRoot}`);
      logger.debug(e);
    }
    return;
  }
  if (parseResult.isEmptySpec) {
    logger.info(
      chalk.red(
        `File ${pathRelativeToRoot} does not exist in working directory`
      )
    );
    return;
  }

  const spinner = ora(`Found OpenAPI at ${pathRelativeToRoot}`);
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
    const name = parseResult.jsonLike?.info?.title ?? pathRelativeToRoot;
    const { id } = await config.client.createApi(orgId, {
      name,
      default_branch: options.default_branch,
      default_tag: options.default_tag,
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
      parseResult = await getFileFromFsOrGit(
        `${sha}:${pathRelativeToRoot}`,
        config,
        {
          strict: false,
          denormalize: true,
        }
      );
    } catch (e) {
      logger.debug(
        `${short(
          sha
        )}:${pathRelativeToRoot} is not a valid OpenAPI file, skipping sha version`,
        e
      );
      continue;
    }
    if (parseResult.isEmptySpec) {
      logger.debug(
        `File ${pathRelativeToRoot} does not exist in sha ${short(
          sha
        )}, stopping here`
      );
      break;
    }
    spinner.text = `${chalk.bold.blue(
      parseResult.jsonLike.info.title || pathRelativeToRoot
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
    if (/.json/i.test(file_path)) {
      await writeJson(file_path, {
        [OPTIC_URL_KEY]: api.url,
      });
    } else {
      await writeYml(file_path, {
        [OPTIC_URL_KEY]: api.url,
      });
    }
    logger.debug(`Added spec ${pathRelativeToRoot} to ${api.url}`);

    trackEvent('api.added', {
      apiId: api.id,
      orgId: orgId,
      url: api.url,
    });

    if (options.web) {
      await open(api.url, { wait: false });
    }
  } else {
    logger.debug(
      `Spec ${pathRelativeToRoot} has already been added at ${api.url}`
    );
  }

  spinner.succeed(
    `${chalk.bold.blue(
      parseResult.jsonLike.info.title || pathRelativeToRoot
    )} ${
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
    } else if (!config.isAuthenticated) {
      logger.error(
        chalk.red(
          'You must be logged in to add APIs to Optic Cloud. Please run "optic login"'
        )
      );
      process.exitCode = 1;
      return;
    }

    let file: {
      path: string;
      isDir: boolean;
    };
    if (path_to_spec) {
      try {
        const isDir = (await fs.lstat(path_to_spec)).isDirectory();
        file = {
          path: path.resolve(path_to_spec),
          isDir,
        };
      } catch (e) {
        logger.error(chalk.red(`${path} is not a file or directory`));

        process.exitCode = 1;
        return;
      }
    } else if (options.all) {
      file = {
        path: path.resolve(config.root),
        isDir: true,
      };
    } else {
      logger.error(
        chalk.red(
          'Invalid argument combination, must specify either a `path` or `--all`'
        )
      );
      process.exitCode = 1;
      return;
    }

    if (file.isDir && options.historyDepth !== '1') {
      logger.error(
        chalk.red(
          'Invalid argument combination: Cannot set a history-depth !== 1 when no spec path is provided'
        )
      );
      process.exitCode = 1;
      return;
    }

    const orgRes = await getOrganizationFromToken(
      config.client,
      'Select the organization you want to add APIs to'
    );
    if (!orgRes.ok) {
      logger.error(orgRes.error);
      process.exitCode = 1;
      return;
    }
    logger.info('');

    let default_branch: string = '';
    let default_tag: string | undefined = undefined;
    let web_url: string | undefined = undefined;

    logger.info('');

    if (config.vcs && config.vcs?.type === VCS.Git) {
      const maybeDefaultBranch = await Git.getDefaultBranchName();
      if (maybeDefaultBranch) {
        default_branch = maybeDefaultBranch;
        default_tag = `gitbranch:${default_branch}`;
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
        const results = await prompts(
          [
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
          ],
          { onCancel: () => process.exit(1) }
        );
        if (results.webUrl) {
          web_url = results.webUrl;
        }
        logger.info('');
      }
    }

    logger.info(
      chalk.bold.gray(
        file.isDir
          ? `Looking for OpenAPI specs in directory ${file.path}`
          : `Adding API ${file.path}`
      )
    );

    let candidates: Map<string, string[]>;

    if (config.vcs?.type === VCS.Git) {
      candidates = !file.isDir
        ? await GitCandidates.getShasCandidatesForPath(
            file.path,
            options.historyDepth
          )
        : await GitCandidates.getPathCandidatesForSha(config.vcs.sha, {
            startsWith: file.path,
          });
    } else {
      const files = !file.isDir
        ? [path.resolve(file.path)]
        : await FsCandidates.getFileCandidates({
            startsWith: file.path,
          });

      candidates = new Map(files.map((f) => [f, []]));
    }

    for await (const candidate of candidates) {
      await crawlCandidateSpecs(orgRes.org.id, candidate, config, {
        path_to_spec: file?.path,
        web: options.web,
        default_branch,
        default_tag,
        web_url,
      });
    }

    logger.info('');
    logger.info(
      chalk.blue.bold(
        `x-optic-url has been added to newly tracked specs. You should commit these changes.`
      )
    );

    logger.info('');
    logger.info(chalk.blue.bold(`Setup CI checks by running "optic ci setup"`));

    await flushEvents();
  };
