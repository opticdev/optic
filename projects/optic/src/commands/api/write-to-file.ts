import fs from 'node:fs/promises';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  applyOperationsToYamlString,
  loadYaml,
  writeYaml,
} from '@useoptic/openapi-io';

import { OPTIC_STANDARD_KEY, OPTIC_URL_KEY } from '../../constants';
import { FlatOpenAPIV3 } from '@useoptic/openapi-utilities';

export async function writeJson(
  path: string,
  data: {
    [OPTIC_URL_KEY]: string;
    [OPTIC_STANDARD_KEY]?: string;
  }
) {
  await fs
    .readFile(path, 'utf-8')
    .then((file) => {
      const parsed = JSON.parse(file);
      parsed[OPTIC_URL_KEY] = data[OPTIC_URL_KEY];
      if (data[OPTIC_STANDARD_KEY]) {
        parsed[OPTIC_STANDARD_KEY] = data[OPTIC_STANDARD_KEY];
      }
      return JSON.stringify(parsed);
    })
    .then((file) => fs.writeFile(path, file));
}

export async function writeYml(
  path: string,
  data: {
    [OPTIC_URL_KEY]: string;
    [OPTIC_STANDARD_KEY]?: string;
  }
) {
  await fs
    .readFile(path, 'utf-8')
    .then((file) => {
      return addExtensionsToYaml(
        file,
        data['OPTIC_STANDARD_KEY']
          ? {
              [OPTIC_URL_KEY]: data[OPTIC_URL_KEY],
              [OPTIC_STANDARD_KEY]: data[OPTIC_STANDARD_KEY]!,
            }
          : { [OPTIC_URL_KEY]: data[OPTIC_URL_KEY] }
      );
    })
    .then((file) => fs.writeFile(path, file));
}

export function addExtensionsToYaml(
  yamlContents: string,
  extensions: { [key: `x-${string}`]: string }
): string {
  const parsed: FlatOpenAPIV3.Document = loadYaml(yamlContents);

  try {
    // delete anything already in spec with a different value
    const toDelete = Object.keys(extensions).filter(
      (extension) =>
        parsed[extension] && parsed[extension] !== extensions[extension]
    );

    const ops: Parameters<typeof applyOperationsToYamlString>[1] = toDelete.map(
      (extension) => ({
        op: 'remove',
        path: jsonPointerHelpers.compile([extension]),
      })
    );

    const cleanedYaml = applyOperationsToYamlString(yamlContents, ops);
    const matches = /["']{0,1}openapi["']{0,1}.*$/gm.exec(cleanedYaml);

    if (matches) {
      const indexOfOpenApiLineNewLine = cleanedYaml.indexOf(
        '\n',
        matches.index
      );

      const extensionLines = Object.entries(extensions).map((extension) => {
        return `${extension[0]}: "${extension[1]}"`;
      });

      return (
        cleanedYaml.substring(0, indexOfOpenApiLineNewLine) +
        (extensionLines.length ? '\n' + extensionLines.join(`\n`) : '') +
        cleanedYaml.substring(indexOfOpenApiLineNewLine)
      );
    } else {
      throw new Error('openapi: 3.x.x line not found');
    }
  } catch (e) {
    const { openapi, ...other } = parsed;
    const updated = {};

    Object.entries(extensions).forEach(
      ([key, value]) => (updated[key] = value)
    );

    // will respect ordering
    return writeYaml({ openapi, ...updated, ...other });
  }
}
