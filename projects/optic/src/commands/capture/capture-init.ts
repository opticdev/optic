import { Command } from 'commander';

import { createOpticConfig } from '../../utils/write-optic-config';
import { initCaptureConfig } from './init';
import { logger } from '../../logger';
import { OpticCliConfig } from '../../config';
import { resolveRelativePath } from '../../utils/capture';

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
      const options = command.opts();
      if (!config.configPath && !options.stdout) {
        try {
          config.configPath = await createOpticConfig(
            config.root,
            'capture',
            {}
          );
        } catch (err) {
          logger.error(err);
          process.exitCode = 1;
          return;
        }
      }

      const relativeOasFile = resolveRelativePath(config.root, specPath);

      // if there is already a specific capture config for the oas file specified call that out and do nothing
      if (
        config.capture &&
        config.capture?.[relativeOasFile] &&
        !options.stdout
      ) {
        logger.warn(
          `optic.yml already contains a capture config for the file ${relativeOasFile}. This command would overwrite the existing configuration. Make changes manually, or view a sample capture configuration with: \`optic capture init optic.yml --stdout\``
        );
        process.exitCode = 1;
        return;
      }

      try {
        await initCaptureConfig(
          relativeOasFile,
          options.stdout!,
          config.configPath!
        );
      } catch (err) {
        logger.error(err);
        process.exitCode = 1;
      }
      return;
    });

  return command;
}
