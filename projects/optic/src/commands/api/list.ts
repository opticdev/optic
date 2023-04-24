import { Command } from 'commander';
import path from 'path';
import fs from 'node:fs/promises';
import { OpticCliConfig } from '../../config';
import {
  getFileFromFsOrGit,
  loadRaw,
  ParseResult,
} from '../../utils/spec-loaders';
import { logger } from '../../logger';
import { OPTIC_EMPTY_SPEC_KEY, OPTIC_URL_KEY } from '../../constants';
import chalk from 'chalk';
import * as FsCandidates from './get-file-candidates';

import { flushEvents } from '@useoptic/openapi-utilities/build/utilities/segment';
import { errorHandler } from '../../error-handler';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

const usage = () => `
  optic api list`;

export const registerApiList = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('list')
    .configureHelp({
      commandUsage: usage,
    })
    .argument('[path_to_spec]', 'path to file or directory to add')
    .description('Add APIs to Optic')
    .action(errorHandler(getApiAddAction(config)));
};

type ApiActionOptions = {};

export const getApiAddAction =
  (config: OpticCliConfig) =>
  async (path_to_spec: string | undefined, options: ApiActionOptions) => {
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
    } else {
      file = {
        path: path.resolve(config.root),
        isDir: true,
      };
    }

    logger.info(
      chalk.bold.gray(`Looking for OpenAPI specs in directory ${file.path}`)
    );

    const files = !file.isDir
      ? [path.resolve(file.path)]
      : await FsCandidates.getFileCandidates({
          startsWith: file.path,
        });

    const candidates: Map<string, string[]> = new Map(
      files.map((f) => [f, []])
    );
    let hasUntrackedApis = false;

    for await (const [file_path] of candidates) {
      const relativePath = path.relative(process.cwd(), file_path);
      let spec: OpenAPIV3.Document;
      try {
        spec = await loadRaw(file_path);
      } catch (e) {
        continue;
      }
      if (spec[OPTIC_EMPTY_SPEC_KEY]) {
        continue;
      }

      const existingOpticUrl: string | undefined = spec[OPTIC_URL_KEY];

      if (!existingOpticUrl) {
        hasUntrackedApis = true;
      }

      logger.info(
        `${relativePath} ${!existingOpticUrl ? chalk.red(` (untracked)`) : ''}`
      );
    }

    if (hasUntrackedApis) {
      logger.info('');
      logger.info(chalk.blue.bold('Run optic api add to add untracked apis'));
    }

    await flushEvents();
  };
