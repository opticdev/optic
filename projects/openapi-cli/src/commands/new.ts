import { Command } from 'commander';
import Path from 'path';
import fs from 'fs-extra';
import { Writable } from 'stream';
import Semver from 'semver';

import * as AT from '../lib/async-tools';
import { createCommandFeedback } from './reporters/feedback';
import { SpecFile, SpecFiles, SpecFileOperations, SpecPatches } from '../specs';

export async function newCommand(): Promise<Command> {
  const command = new Command('new');

  const feedback = await createCommandFeedback(command);

  command
    .description('create a new OpenAPI spec file')
    .alias('create')
    .argument(
      '[file-path]',
      'path of the new OpenAPI file (written to stdout when not provided)'
    )
    .option(
      '--oas-version <version-number>',
      'OpenAPI version number to be used',
      '3.0.3'
    )
    .action(async (filePath?: string) => {
      let absoluteFilePath: string;
      let destination: Writable;

      if (filePath) {
        absoluteFilePath = Path.resolve(filePath);
        let dirPath = Path.dirname(absoluteFilePath);
        let fileBaseName = Path.basename(filePath);
        if (await fs.pathExists(absoluteFilePath)) {
          return feedback.inputError(
            `File '${fileBaseName}' already exists at ${dirPath}`
          );
        }
        if (!(await fs.pathExists(dirPath))) {
          return feedback.inputError(
            `to create ${fileBaseName}, dir must exist at ${dirPath}`
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
          return feedback.inputError(
            `--oas-version must be a valid OpenAPI version`
          );
        } else if (!Semver.satisfies(semver, '3.0.x || 3.1.x')) {
          // TODO: track this to get an idea of other versions we should support
          return feedback.inputError(
            `currently only OpenAPI v3.0.x and v3.1.x spec files can be created`
          );
        } else {
          oasVersion = semver.version;
        }
      } else {
        oasVersion = '3.0.3';
      }

      let newSpecFile = await createNewSpecFile(absoluteFilePath, oasVersion);

      SpecFile.write(newSpecFile, destination);
    });

  return command;
}

async function createNewSpecFile(
  absoluteFilePath: string,
  oasVersion: string = '3.0.3'
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
