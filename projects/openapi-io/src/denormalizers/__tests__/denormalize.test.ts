import { test, expect, describe } from '@jest/globals';
import path from 'path';

import { denormalize } from '../denormalize';
import {
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from '../../parser/openapi-sourcemap-parser';

function prepSnapshot(result: ParseOpenAPIResult<any>) {
  const cwd = process.cwd();
  result.sourcemap.files.forEach((i) => {
    i.path = i.path.split(cwd)[1];
    // @ts-ignore
    i.index = null;
  });

  result.sourcemap.rootFilePath = result.sourcemap.rootFilePath.split(cwd)[1];

  result.sourcemap.files = result.sourcemap.files.sort((a, b) =>
    a.path.toLocaleLowerCase().localeCompare(b.path.toLocaleLowerCase())
  );
  return result;
}

describe('denormalize v2', () => {
  test('denormalizes shared path parameters', async () => {
    const specPath = path.resolve(
      'src/denormalizers/__tests__/specs/v2/openapi.yaml'
    );
    const spec = await parseOpenAPIWithSourcemap(specPath);

    const denormalized = denormalize(spec, '2.x.x');

    expect(prepSnapshot(denormalized)).toMatchSnapshot();
  });
});

describe('denormalize v3', () => {
  test('denormalizes shared path parameters', async () => {
    const specPath = path.resolve(
      'src/denormalizers/__tests__/specs/v3/openapi.yaml'
    );
    const spec = await parseOpenAPIWithSourcemap(specPath);

    const denormalized = denormalize(spec, '3.0.x');

    expect(prepSnapshot(denormalized)).toMatchSnapshot();
  });

  describe('allOf merging', () => {
    test.each([
      [
        'merges allOf when all items are objects',
        'src/denormalizers/__tests__/specs/v3/allOf/single-allof.yaml',
      ],
      [
        'does not merge allOf when all items are not all objects',
        'src/denormalizers/__tests__/specs/v3/allOf/no-merge.yaml',
      ],
      [
        'merges nested allOf',
        'src/denormalizers/__tests__/specs/v3/allOf/nested.yaml',
      ],
      [
        'merges allOfs in type array object / items',
        'src/denormalizers/__tests__/specs/v3/allOf/in-type-array.yaml',
      ],
      [
        'merges allOf with only one item',
        'src/denormalizers/__tests__/specs/v3/allOf/single-child.yaml',
      ],
    ])('%s', async (_, openapiFilePath) => {
      const spec = await parseOpenAPIWithSourcemap(
        path.resolve(openapiFilePath)
      );
      const warnings: string[] = [];
      const denormalized = denormalize(spec, '3.0.x', warnings);

      expect(prepSnapshot(denormalized)).toMatchSnapshot();
      expect(warnings).toMatchSnapshot('warnings');
    });
  });
});
