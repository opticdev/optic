import * as Sentry from '@sentry/node';
import fs from 'node:fs/promises';
import {
  SerializedSourcemap,
  UserError,
  sourcemapReader,
} from '@useoptic/openapi-utilities';
import { isYaml, loadYaml, writeYaml } from '@useoptic/openapi-io';
import jsonpatch, { Operation } from 'fast-json-patch';
import { logger } from '../../../logger';
import chalk from 'chalk';

export async function writePatchesToFiles(
  jsonPatches: Operation[],
  sourcemap: SerializedSourcemap
) {
  const sourcemapQueries = sourcemapReader(sourcemap);
  const operationsByFile: { [key: string]: Operation[] } = {};

  for (const patch of jsonPatches) {
    const result = sourcemapQueries.findFilePosition(patch.path);
    const { filePath, startsAt } = result;
    const adjustedPatch = { ...patch, path: startsAt };

    if (!operationsByFile[filePath]) operationsByFile[filePath] = [];

    operationsByFile[filePath].push(adjustedPatch);
  }

  // Then apply the patches and write files to disk
  for (let [filePath, operations] of Object.entries(operationsByFile)) {
    const file = sourcemap.files.find(({ path }) => path === filePath)!;

    const parsed = parse(filePath, file.contents);
    let stringified: string;
    try {
      const patchedContents = jsonpatch.applyPatch(
        parsed || {},
        operations
      ).newDocument;
      stringified = stringify(filePath, patchedContents);
    } catch (e) {
      logger.error('');
      logger.error(
        chalk.red.bold(`Error: Failed writing patches to ${filePath}`)
      );
      logger.debug({
        location: 'patch files',
        error: e,
        operations: JSON.stringify(operations),
        parsed: JSON.stringify(parsed),
      });
      Sentry.captureException(e, {
        extra: {
          operations,
          parsed,
        },
      });
      throw new UserError();
    }

    await fs.writeFile(filePath, stringified);
  }
}

function parse(filePath: string, fileContents: string) {
  if (isYaml(filePath)) {
    return loadYaml(fileContents);
  } else {
    return fileContents ? JSON.parse(fileContents) : {};
  }
}

function stringify(filePath: string, document: any) {
  if (isYaml(filePath)) {
    return writeYaml(document);
  } else {
    return JSON.stringify(document, null, 2);
  }
}
