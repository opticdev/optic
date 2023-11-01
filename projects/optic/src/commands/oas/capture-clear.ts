import { Command } from 'commander';
import path from 'path';
import * as fs from 'fs-extra';
import { captureStorage } from './captures/capture-storage';
import { createCommandFeedback, InputErrors } from './reporters/feedback';
import Path from 'path';
import os from 'os';
const tmpDirectory = os.tmpdir();

export function clearCommand(): Command {
  const command = new Command('clear');
  const feedback = createCommandFeedback(command);

  command
    .description('Clear captures for an OpenAPI spec')
    .helpOption('-h, --help', 'Display help for the command')
    .argument('[openapi-file]', 'The OpenAPI spec to clear')
    .option('--all', 'Clear all captured traffic')
    .action(async (specPath) => {
      const options = command.opts();
      if (options.all) {
        const allCaptures = path.join(tmpDirectory, 'optic', 'captures');
        await fs.remove(allCaptures);
        feedback.success('Cleared all captures ' + allCaptures);
      }
      if (specPath) {
        const absoluteSpecPath = Path.resolve(specPath);
        const { trafficDirectory, openApiExists } =
          await captureStorage(specPath);
        if (!openApiExists) {
          return await feedback.inputError(
            'OpenAPI specification file could not be found',
            InputErrors.SPEC_FILE_NOT_FOUND
          );
        }
        await fs.remove(trafficDirectory);
        feedback.success(
          'Cleared capture folder for ' +
            path.relative(process.cwd(), absoluteSpecPath)
        );
      }
    });

  return command;
}
