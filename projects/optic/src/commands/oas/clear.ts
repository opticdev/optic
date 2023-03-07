import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';

import { createCommandFeedback, InputErrors } from './reporters/feedback';
import { captureStorage } from './captures/capture-storage';
import path from 'path';

export async function clearCommand(): Promise<Command> {
  const command = new Command('clear');
  const feedback = createCommandFeedback(command);

  command
    .description('clear captures for the OpenAPI file')
    .argument(
      '<openapi-file>',
      'an OpenAPI spec to match up to observed traffic'
    )
    .action(async (specPath) => {
      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return await feedback.inputError(
          'OpenAPI specification file could not be found',
          InputErrors.SPEC_FILE_NOT_FOUND
        );
      }
      const [, captureStorageDirectory] = await captureStorage(specPath);
      await fs.remove(captureStorageDirectory);
      feedback.success(
        'Cleared capture folder for ' +
          path.relative(process.cwd(), absoluteSpecPath)
      );
    });

  return command;
}
