import { Command, Option } from 'commander';
import p from 'path';

import { compute } from '../diff/compute';
import { loadSpec, ParseResult } from '../../utils/spec-loaders';
import { OpticCliConfig } from '../../config';
import { errorHandler } from '../../error-handler';
import { logger } from '../../logger';
import { textToSev } from '@useoptic/openapi-utilities';
import chalk from 'chalk';
import { generateComparisonLogsV2 } from '../../utils/diff-renderer';
import { compressDataV2 } from '../diff/compressResults';
import { flushEvents, trackEvent } from '../../segment';
import { openUrl } from '../../utils/open-url';

const description = `lints and validates an OpenAPI file`;

const usage = () => `
  optic lint ./spec.yml
  optic lint main:spec.yml`;

export const registerLint = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('lint', { hidden: true })
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
    .option('--web', 'view the lint results in the optic web view', false)
    .description(description)
    .argument('<file_path>', 'path to file to lint')
    .action(errorHandler(getLintAction(config), { command: 'lint' }));
};

type LintActionOptions = {
  severity: 'info' | 'warn' | 'error';
  web: boolean;
};

const getLintAction =
  (config: OpticCliConfig) =>
  async (path: string, options: LintActionOptions) => {
    logger.info(`Linting spec ${path}...`);
    let file: ParseResult;
    try {
      file = await loadSpec(path, config, {
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

    logger.info(chalk.green.bold('✔ OpenAPI is valid'));

    if (checks.total > 0) {
      logger.info('');
      logger.info('Running Optic Checks');
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

      if (options.web) {
        const analyticsData: Record<string, any> = {
          isInCi: config.isInCi,
        };

        const meta = {
          createdAt: new Date(),
          command: ['optic', ...process.argv.slice(2)].join(' '),
          file1: path,
        };

        const compressedData = compressDataV2(
          file,
          file,
          specResults,
          meta,
          changelogData
        );
        analyticsData.compressedDataLength = compressedData.length;
        logger.info('Opening up lint results in web view');

        trackEvent('optic.lint.view_web', analyticsData);
        await flushEvents();
        const baseHtml = p.resolve(__dirname, '../../../web/build/index.html');
        await openUrl(`${baseHtml}#${compressedData}`);
      }

      if (failuresForSeverity > 0) {
        logger.info(
          chalk.red.bold('x Check failures detected with your OpenAPI spec.')
        );
        process.exitCode = 1;
      } else {
        logger.info(chalk.green.bold('✔ Checks passed.'));
      }
    }
  };
