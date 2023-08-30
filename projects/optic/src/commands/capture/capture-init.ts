import { Command } from 'commander';

import { initCaptureConfig } from './init';
import { logger } from '../../logger';
import { OpticCliConfig } from '../../config';
import { resolveRelativePath } from '../../utils/capture';
import path from 'path';
import { normalize } from 'crosspath';
import chalk from 'chalk';

type CaptureInitActionOptions = {
  stdout: boolean;
};

export function initCommand(config: OpticCliConfig): Command {
  const command = new Command('init');

  command
    .description('Add a `capture` block to your Optic.yml')
    .argument(
      'openapi-file',
      'the OpenAPI specification to write the `capture` block for'
    )
    .option(
      '--stdout',
      'Print the capture config to stdout instead of writing to optic.yml',
      false
    )
    .action(async (specPath) => {
      const options: CaptureInitActionOptions = command.opts();

      const relativeOasFile = resolveRelativePath(config.root, specPath);
      let configPath: string | undefined = undefined;
      if (config.capture?.[relativeOasFile] && !options.stdout) {
        logger.error(
          `optic.yml already contains a capture config for the file ${relativeOasFile}. This command would overwrite the existing configuration. Make changes manually, or view a sample capture configuration with: \`optic capture init optic.yml --stdout\``
        );
        process.exitCode = 1;
        return;
      }

      try {
        configPath = await initCaptureConfig(
          normalize(relativeOasFile),
          options.stdout,
          config
        );
      } catch (err) {
        logger.error(err);
        process.exitCode = 1;
        return;
      }

      if (configPath) {
        logger.info(
          `${chalk.green('✔')} Wrote capture config to ${path.relative(
            process.cwd(),
            configPath
          )}`
        );
        logger.info('');
        logger.info(`Next:`);
        logger.info(`- Edit the configuration to match your setup (🔧)`);
        logger.info(
          `    A full reference for the configuration can be found at https://www.useoptic.com/docs/capturing-traffic#configuration-reference`
        );
        logger.info(
          `- Then run: optic capture ${relativeOasFile} --update interaction `
        );
      }
    });

  return command;
}
