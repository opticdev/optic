import fs from 'node:fs/promises';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { applyOperationsToYamlString } from '@useoptic/openapi-io';

import { OPTIC_STANDARD_KEY, OPTIC_URL_KEY } from '../../constants';

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
      const ops: Parameters<typeof applyOperationsToYamlString>[1] = [
        {
          op: 'replace',
          value: data[OPTIC_URL_KEY],
          path: jsonPointerHelpers.compile([OPTIC_URL_KEY]),
        },
      ];

      if (data[OPTIC_STANDARD_KEY]) {
        ops.push({
          op: 'replace',
          value: data[OPTIC_STANDARD_KEY],
          path: jsonPointerHelpers.compile([OPTIC_STANDARD_KEY]),
        });
      }

      return applyOperationsToYamlString(file, ops);
    })
    .then((file) => fs.writeFile(path, file));
}
