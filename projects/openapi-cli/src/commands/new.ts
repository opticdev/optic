import { Command } from 'commander';
import Path from 'path';
import fs from 'fs-extra';
import { Writable } from 'stream';

import * as AT from '../lib/async-tools';
import { SpecFile, SpecFiles, SpecFileOperations, SpecPatches } from '../specs';

export function newCommand(): Command {
  const command = new Command('new');

  command
    .argument('[file-path]')
    .description('create a new OpenAPI spec file')
    .action(async (filePath?: string) => {
      let absoluteFilePath: string;
      let destination: Writable;

      if (filePath) {
        absoluteFilePath = Path.resolve(filePath);
        let dirPath = Path.dirname(absoluteFilePath);
        if (await fs.pathExists(absoluteFilePath)) {
          return command.error(`File already exists at ${filePath}`);
        }
        if (!(await fs.pathExists(dirPath))) {
          return command.error(
            `path ${dirPath} must exist to create a new spec file at ${absoluteFilePath}`
          );
        }

        destination = fs.createWriteStream(absoluteFilePath);
      } else {
        absoluteFilePath = 'stdout.yml';
        destination = process.stdout;
      }

      let newSpecFile = await createNewSpecFile(absoluteFilePath);

      SpecFile.write(newSpecFile, destination);
    });

  return command;
}

async function createNewSpecFile(absoluteFilePath: string): Promise<SpecFile> {
  let info = {
    title: 'Untitled service',
    version: '1.0.0',
  };

  const newSpecFile = SpecFile.create(absoluteFilePath);
  const specPatches = SpecPatches.generateForNewSpec(info);

  const fileOperations = SpecFileOperations.fromNewFilePatches(
    newSpecFile.path,
    specPatches
  );

  const [updatedSpecFile] = await AT.collect(
    SpecFiles.patch([newSpecFile], fileOperations)
  );

  return updatedSpecFile;
}
