import { Command } from 'commander';
import fs from 'fs-extra';
import Semver from 'semver';
import { isJson, isYaml, writeYaml } from '@useoptic/openapi-io';
import { trackEvent, flushEvents } from './lib/segment';
import { createCommandFeedback, InputErrors } from './reporters/feedback';
import { logger } from '../../logger';
import { createNewSpecFile } from '../../utils/specs';

const defaultOpenAPIVersion = '3.1.0';

export async function newCommand(): Promise<Command> {
  const command = new Command('new');

  const feedback = createCommandFeedback(command);

  command
    .description('create a new OpenAPI spec file')
    .argument(
      '<file-path>',
      'path of the new OpenAPI file (written to stdout when not provided)'
    )
    .option(
      '--oas-version <version-number>',
      'OpenAPI version number to be used',
      defaultOpenAPIVersion
    )
    .action(async (filePath: string) => {
      if (await fs.pathExists(filePath)) {
        return await feedback.inputError(
          `File  already exists at ${filePath}`,
          InputErrors.DESTINATION_FILE_ALREADY_EXISTS
        );
      }
      if (!isJson(filePath) && !isYaml(filePath)) {
        return await feedback.inputError(
          `to create a new spec file by filename, either a .yml, .yaml or .json extension is required`,
          'spec-file-extension-unsupported'
        );
      }

      const options = command.opts();

      let oasVersion: string;
      if (options.oasVersion) {
        let semver = Semver.coerce(options.oasVersion); // be liberal with the inputs we accept
        if (!semver || !Semver.valid(semver)) {
          return await feedback.inputError(
            `--oas-version must be a valid OpenAPI version`,
            'oas-version-uninterpretable',
            { suppliedVersion: options.oasVersion }
          );
        } else if (!Semver.satisfies(semver, '3.0.x || 3.1.x')) {
          return await feedback.inputError(
            `currently only OpenAPI v3.0.x and v3.1.x spec files can be created`,
            'oas-version-unsupported',
            { suppliedVersion: semver.version }
          );
        } else {
          oasVersion = semver.version;
        }
      } else {
        oasVersion = defaultOpenAPIVersion;
      }

      const specFile = createNewSpecFile(oasVersion);
      if (isJson(filePath)) {
        logger.info(`Initializing OpenAPI file at ${filePath}`);
        await fs.writeFile(filePath, JSON.stringify(specFile, null, 2));
      } else if (isYaml(filePath)) {
        logger.info(`Initializing OpenAPI file at ${filePath}`);
        await fs.writeFile(filePath, writeYaml(specFile));
      } else {
        return await feedback.inputError(
          'OpenAPI file not found',
          InputErrors.SPEC_FILE_NOT_FOUND
        );
      }

      await trackStats({ oasVersion });
      feedback.success(`New spec file created at ${filePath}`);
    });
  return command;
}

async function trackStats({ oasVersion }: { oasVersion: string }) {
  trackEvent('openapi_cli.new.completed', {
    oasVersion,
  });

  try {
    await flushEvents();
  } catch (err) {
    console.warn('Could not flush usage analytics (non-critical)');
  }
}
