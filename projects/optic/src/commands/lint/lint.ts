import { Command, Option } from 'commander';

import { compute } from '../diff/compute';
import { getFileFromFsOrGit, ParseResult } from '../../utils/spec-loaders';
import { OpticCliConfig } from '../../config';
import { errorHandler } from '../../error-handler';
import { logger } from '../../logger';
import { textToSev } from '@useoptic/openapi-utilities';
import chalk from 'chalk';
import { generateComparisonLogsV2 } from '../../utils/diff-renderer';

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
    .addOption(
      new Option(
        '--severity <severity>',
        'specify the severity level to exit with exit code, options are error, warn and info'
      )
        .choices(['error', 'warn', 'info'])
        .default('error')
    )
    .description(description)
    .argument('<file_path>', 'path to file to lint')
    .action(errorHandler(getLintAction(config)));
};

type LintActionOptions = {
  severity: 'info' | 'warn' | 'error';
};

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
      {
        output: 'pretty',
        verbose: false,
        severity: textToSev(options.severity),
      }
    )) {
      logger.info(log);
    }

    logger.info('');
    const failures = checks.failed;
    const failuresForSeverity =
      options.severity === 'error'
        ? failures.error
        : options.severity === 'warn'
        ? failures.warn + failures.error
        : failures.warn + failures.error + failures.info;

    if (failuresForSeverity > 0) {
      logger.info(
        chalk.red.bold('Linting errors found with your OpenAPI spec.')
      );
      process.exitCode = 1;
    } else {
      logger.info(chalk.green.bold('Linting passed.'));
    }
  };
