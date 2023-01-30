import { test, expect, describe } from '@jest/globals';
import path from 'path';

import { denormalize } from '../denormalize';
import {
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from '../../parser/openapi-sourcemap-parser';
import sortBy from 'lodash.sortby';

function prepSnapshot(result: ParseOpenAPIResult) {
  const cwd = process.cwd();
  result.sourcemap.files.forEach((i) => {
    i.path = i.path.split(cwd)[1];
    // @ts-ignore
    i.index = null;
  });

  result.sourcemap.rootFilePath = result.sourcemap.rootFilePath.split(cwd)[1];

  result.sourcemap.files = sortBy(result.sourcemap.files, 'path');

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
});
