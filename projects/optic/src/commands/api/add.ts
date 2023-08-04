import { Command } from 'commander';
import prompts from 'prompts';
import open from 'open';
import path from 'path';
import fs from 'node:fs/promises';
import { OpticCliConfig, VCS } from '../../config';
import { loadSpec, ParseResult } from '../../utils/spec-loaders';
import { logger } from '../../logger';
import { OPTIC_URL_KEY } from '../../constants';
import chalk from 'chalk';
import * as GitCandidates from './git-get-file-candidates';
import * as FsCandidates from './get-file-candidates';
import { uploadSpec } from '../../utils/cloud-specs';
import * as Git from '../../utils/git-utils';

import { getApiUrl, getOpticUrlDetails } from '../../utils/cloud-urls';
import { flushEvents, trackEvent } from '../../segment';
import { errorHandler } from '../../error-handler';
import { getOrganizationFromToken } from '../../utils/organization';
import { sanitizeGitTag } from '@useoptic/openapi-utilities';
import stableStringify from 'json-stable-stringify';
import { computeChecksumForAws } from '../../utils/checksum';
import { getSpinner } from '../../utils/spinner';
import { getUniqueTags } from '../../utils/tags';

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
    .action(errorHandler(getApiAddAction(config), { command: 'api-add' }));
};

type ApiAddActionOptions = {
  historyDepth: string;
  web: boolean;
  all: boolean;
};

async function initializeApi(
  orgId: string,
  file_path: string,
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
    parseResult = await loadSpec(file_path, config, {
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
  const specName = parseResult.jsonLike.info.title || 'Untitled spec';

  const existingOpticUrl: string | undefined =
    parseResult.jsonLike[OPTIC_URL_KEY];

  const opticUrlDetails = await getOpticUrlDetails(config, {
    filePath: options.path_to_spec
      ? path.relative(config.root, path.resolve(options.path_to_spec))
      : undefined,
    opticUrl: existingOpticUrl,
  });

  let alreadyTracked = false;
  let tagsToAdd: string[] = [];

  let api: { id: string; url: string };
  if (opticUrlDetails) {
    alreadyTracked = true;
    api = {
      id: opticUrlDetails.apiId,
      url:
        existingOpticUrl ??
        getApiUrl(
          config.client.getWebBase(),
          opticUrlDetails.orgId,
          opticUrlDetails.apiId
        ),
    };
  } else {
    if (config.vcs?.type === VCS.Git) {
      const sha = config.vcs.sha;
      tagsToAdd.push(`git:${sha}`);

      const branch = await Git.getCurrentBranchName();
      if (branch !== 'HEAD') {
        tagsToAdd.push(sanitizeGitTag(`gitbranch:${branch}`));
        logger.info(
          `Automatically adding the git sha 'git:${sha}' and branch 'gitbranch:${branch}' as tags`
        );
      } else {
        logger.info(`Automatically adding the git sha 'git:${sha}' as a tag`);
      }
    }

    const name = parseResult.jsonLike?.info?.title ?? pathRelativeToRoot;
    const { id } = await config.client.createApi(orgId, {
      name,
      path: path.relative(
        config.root,
        path.resolve(options.path_to_spec ?? '')
      ),
      default_branch: options.default_branch,
      default_tag: options.default_tag,
      web_url: options.web_url,
    });
    api = {
      id,
      url: getApiUrl(config.client.getWebBase(), orgId, id),
    };
  }
  await uploadSpec(api.id, {
    spec: parseResult,
    tags: getUniqueTags(tagsToAdd),
    client: config.client,
    orgId,
  });

  if (!opticUrlDetails) {
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

  logger.info(
    `${chalk.bold.green('✔')} ${chalk.bold.blue(specName)} ${
      alreadyTracked ? 'is already being tracked' : 'is now being tracked'
    }.\n  ${chalk.bold(`View: ${chalk.underline(api.url)}`)}`
  );

  return {
    specName,
    api,
    file_path,
    alreadyTracked,
  };
}

async function backfillHistory(
  orgId: string,
  shas: string[],
  addedApis: NonNullable<Awaited<ReturnType<typeof initializeApi>>>[],
  config: OpticCliConfig,
  options: {
    path_to_spec: string | undefined;
    web?: boolean;
    default_branch: string;
    default_tag?: string | undefined;
    web_url?: string;
  }
) {
  const specsStatus = new Map<
    string,
    { completed: boolean; uploadedChecksums: Set<string> }
  >();

  logger.info('');
  const spinner = getSpinner(``);
  spinner?.start();
  if (spinner) spinner.color = 'blue';

  if (config.vcs?.type === VCS.Git) {
    const currentBranch = await Git.getCurrentBranchName();
    let mergeBaseSha: string | null = null;
    let shouldTag = true;
    let branchToUseForTag = currentBranch;

    if (options.default_branch !== '') {
      mergeBaseSha = await Git.getMergeBase(
        currentBranch,
        options.default_branch
      );
      shouldTag = false;
      branchToUseForTag = options.default_branch;
    }

    for await (const sha of shas) {
      if (mergeBaseSha === sha) {
        shouldTag = true;
      }
      const baseText = `${chalk.bold.blue(
        'Backfilling'
      )} version ${sha.substring(0, 6)}`;
      if (spinner) spinner.text = baseText;

      for (const { api, file_path } of addedApis) {
        const pathRelativeToRoot = path.relative(config.root, file_path);
        const status = specsStatus.get(pathRelativeToRoot) ?? {
          completed: false,
          uploadedChecksums: new Set(),
        };

        if (status.completed) {
          continue;
        }

        if (spinner) spinner.text = `${baseText} file ${pathRelativeToRoot}`;

        let parseResult: ParseResult;
        try {
          parseResult = await loadSpec(`${sha}:${pathRelativeToRoot}`, config, {
            strict: false,
            denormalize: true,
          });
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
          specsStatus.set(pathRelativeToRoot, {
            ...status,
            completed: true,
          });
          continue;
        }

        const stableSpecString = stableStringify(parseResult.jsonLike);
        const checksum = computeChecksumForAws(stableSpecString);
        if (status.uploadedChecksums.has(checksum)) {
          continue;
        }

        const specId = await uploadSpec(api.id, {
          spec: parseResult,
          tags: [`git:${sha}`],
          client: config.client,
          orgId,
          forward_effective_at_to_tags: true,
          precomputed: {
            specString: stableSpecString,
            specChecksum: checksum,
          },
        });
        status.uploadedChecksums.add(checksum);
        const effective_at =
          parseResult.context?.vcs === 'git'
            ? parseResult.context.effective_at
            : undefined;

        if (shouldTag) {
          const tags = [sanitizeGitTag(`gitbranch:${branchToUseForTag}`)];
          await config.client.tagSpec(specId, tags, effective_at);
        }

        specsStatus.set(pathRelativeToRoot, status);
      }
    }
  }
  spinner?.succeed(`Successfully backfilled history`);
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

    let candidates: { shas: string[]; paths: string[] };

    if (config.vcs?.type === VCS.Git) {
      candidates = !file.isDir
        ? await GitCandidates.getShasCandidatesForPath(
            file.path,
            options.historyDepth
          )
        : await GitCandidates.getPathCandidatesForSha(config.vcs.sha, {
            startsWith: file.path,
            depth: options.historyDepth,
          });
    } else {
      const files = !file.isDir
        ? [path.resolve(file.path)]
        : await FsCandidates.getFileCandidates({
            startsWith: file.path,
          });

      candidates = { shas: [], paths: files };
    }
    const addedApis: NonNullable<Awaited<ReturnType<typeof initializeApi>>>[] =
      [];
    for await (const file_path of candidates.paths) {
      const api = await initializeApi(orgRes.org.id, file_path, config, {
        path_to_spec: file?.path,
        web: options.web,
        default_branch,
        default_tag,
        web_url,
      });

      if (api) {
        addedApis.push(api);
      }
    }

    const someTracked = candidates.paths.some((p) => Git.isTracked(p));

    if (addedApis.length > 0 && candidates.shas.length > 0 && someTracked) {
      logger.info(``);
      if (candidates.shas.length === 1) {
        logger.info(
          chalk.yellow(
            'Hint: add `--history-depth=0` to backfill the entire history of your API'
          )
        );
      } else {
        logger.info(
          chalk.blue.bold(
            'Backfilling API history, you can exit at any time (`ctrl + c`) and finish this later.'
          )
        );
      }
      await backfillHistory(orgRes.org.id, candidates.shas, addedApis, config, {
        path_to_spec: file?.path,
        web: options.web,
        default_branch,
        default_tag,
        web_url,
      });
    }

    logger.info('');
    logger.info(chalk.blue.bold(`Setup CI checks by running "optic ci setup"`));

    await flushEvents();
  };
