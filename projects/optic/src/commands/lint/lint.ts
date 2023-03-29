import { Command } from 'commander';

import { compute } from '../diff/compute';
import { getFileFromFsOrGit, ParseResult } from '../../utils/spec-loaders';
import { OpticCliConfig } from '../../config';
import { errorHandler } from '../../error-handler';
import { logger } from '../../logger';
import { generateComparisonLogsV2 } from '@useoptic/openapi-utilities';
import chalk from 'chalk';

const description = `lints and validates an OpenAPI file`;

const usage = () => `
  optic lint ./spec.yml
  optic lint main:spec.yml`;

export const registerLint = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('lint')
    .configureHelp({
      commandUsage: usage,
    })
    .description(description)
    .argument('<file_path>', 'path to file to lint')
    .action(errorHandler(getLintAction(config)));
};

type LintActionOptions = {};

const getLintAction =
  (config: OpticCliConfig) =>
  async (path: string, options: LintActionOptions) => {
    logger.info(`Linting spec ${path}...`);
    let file: ParseResult;
    try {
      file = await getFileFromFsOrGit(path, config, {
        strict: true,
        denormalize: true,
      });
    } catch (e) {
      logger.error(e instanceof Error ? e.message : e);
      process.exitCode = 1;
      return;
    }

    const { changelogData, specResults, checks } = await compute(
      [file, file],
      config,
      {
        check: true,
        path,
      }
    );

    logger.info('');
    logger.info('Checks');
    logger.info('');

    for (const log of generateComparisonLogsV2(
      changelogData,
      {
        from: file.sourcemap,
        to: file.sourcemap,
      },
      specResults,
      { output: 'pretty', verbose: false }
    )) {
      logger.info(log);
    }

    logger.info('');
    if (checks.failed > 0) {
      logger.info(
        chalk.red.bold('Linting errors found with your OpenAPI spec.')
      );
      process.exitCode = 1;
    } else {
      logger.info(chalk.green.bold('Linting passed.'));
    }
  };
