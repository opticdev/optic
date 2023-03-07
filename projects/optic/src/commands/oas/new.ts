import { Command } from 'commander';
import Path from 'path';
import fs from 'fs-extra';
import { Writable, finished } from 'stream';
import Semver from 'semver';
import { promisify } from 'util';
import { isJson, isYaml } from '@useoptic/openapi-io';

import * as AT from './lib/async-tools';
import { trackEvent, flushEvents } from './lib/segment';
import { createCommandFeedback, InputErrors } from './reporters/feedback';
import { SpecFile, SpecFiles, SpecFileOperations, SpecPatches } from './specs';

const streamFinished = promisify(finished);

const defaultOpenAPIVersion = '3.1.0';

export async function newCommand(): Promise<Command> {
  const command = new Command('new');

  const feedback = createCommandFeedback(command);

  command
    .description('create a new OpenAPI spec file')
    .argument(
      '[file-path]',
      'path of the new OpenAPI file (written to stdout when not provided)'
    )
    .option(
      '--oas-version <version-number>',
      'OpenAPI version number to be used',
      defaultOpenAPIVersion
    )
    .action(async (filePath?: string) => {
      let absoluteFilePath: string;
      let destination: Writable;

      if (filePath) {
        absoluteFilePath = Path.resolve(filePath);
        let dirPath = Path.dirname(absoluteFilePath);
        let fileBaseName = Path.basename(filePath);
        if (await fs.pathExists(absoluteFilePath)) {
          return await feedback.inputError(
            `File '${fileBaseName}' already exists at ${dirPath}`,
            InputErrors.DESTINATION_FILE_ALREADY_EXISTS
          );
        }
        if (!(await fs.pathExists(dirPath))) {
          return await feedback.inputError(
            `to create ${fileBaseName}, dir must exist at ${dirPath}`,
            InputErrors.DESTINATION_FILE_DIR_MISSING
          );
        }
        if (!isJson(filePath) && !isYaml(filePath)) {
          return await feedback.inputError(
            `to create a new spec file by filename, either a .yml, .yaml or .json extension is required`,
            'spec-file-extension-unsupported'
          );
        }

        destination = fs.createWriteStream(absoluteFilePath);
        destination.once('finish', () => {
          feedback.success(`New spec file created at ${absoluteFilePath}`);
        });
      } else {
        absoluteFilePath = 'stdout.yml';
        destination = process.stdout;
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
          // TODO: track this to get an idea of other versions we should support
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

      let newSpecFile = await createNewSpecFile(absoluteFilePath, oasVersion);
      let trackingStats = streamFinished(destination).then(() =>
        trackStats({ oasVersion })
      );
      SpecFile.write(newSpecFile, destination);

      await trackingStats;
    });

  return command;
}

async function createNewSpecFile(
  absoluteFilePath: string,
  oasVersion: string = defaultOpenAPIVersion
): Promise<SpecFile> {
  let info = {
    title: 'Untitled service',
    version: '1.0.0',
  };

  const newSpecFile = SpecFile.create(absoluteFilePath);
  const specPatches = SpecPatches.generateForNewSpec(info, oasVersion);

  const fileOperations = SpecFileOperations.fromNewFilePatches(
    newSpecFile.path,
    specPatches
  );

  const [updatedSpecFile] = await AT.collect(
    SpecFiles.patch([newSpecFile], fileOperations)
  );

  return updatedSpecFile;
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
