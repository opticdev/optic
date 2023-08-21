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
