import { test, expect, describe } from '@jest/globals';
import path from 'path';

import { denormalize } from '../denormalize';
import {
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from '../../parser/openapi-sourcemap-parser';

function prepSnapshot(result: ParseOpenAPIResult) {
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
describe('denormalize', () => {
  test('denormalizes shared path parameters', async () => {
    const specPath = path.resolve(
      'src/denormalizers/__tests__/specs/openapi.yaml'
    );
    const spec = await parseOpenAPIWithSourcemap(specPath);

    const denormalized = denormalize(spec);

    expect(prepSnapshot(denormalized)).toMatchSnapshot();
  });

  describe('allOf merging', () => {
    test.each([
      [
        'merges allOf when all items are objects',
        'src/denormalizers/__tests__/specs/allOf/single-allof.yaml',
      ],
      [
        'does not merge allOf when all items are not all objects',
        'src/denormalizers/__tests__/specs/allOf/no-merge.yaml',
      ],
      [
        'merges nested allOf',
        'src/denormalizers/__tests__/specs/allOf/nested.yaml',
      ],
      [
        'merges allOfs in type array object / items',
        'src/denormalizers/__tests__/specs/allOf/in-type-array.yaml',
      ],
      [
        'merges allOf with only one item',
        'src/denormalizers/__tests__/specs/allOf/single-child.yaml',
      ],
    ])('%s', async (_, openapiFilePath) => {
      const spec = await parseOpenAPIWithSourcemap(
        path.resolve(openapiFilePath)
      );
      const warnings: string[] = [];
      const denormalized = denormalize(spec, warnings);

      expect(prepSnapshot(denormalized)).toMatchSnapshot();
      expect(warnings).toMatchSnapshot('warnings');
    });
  });
});
