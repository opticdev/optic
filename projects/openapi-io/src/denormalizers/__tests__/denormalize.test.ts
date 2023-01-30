import { test, expect, describe } from '@jest/globals';
import path from 'path';

import { denormalize } from '../denormalize';
import { parseOpenAPIWithSourcemap } from '../../parser/openapi-sourcemap-parser';

describe('denormalize', () => {
  test('denormalizes shared path parameters', async () => {
    const specPath = path.resolve(
      'src/denormalizers/__tests__/specs/openapi.yaml'
    );
    const spec = await parseOpenAPIWithSourcemap(specPath);

    const denormalized = denormalize(spec);

    expect(denormalized).toMatchSnapshot();
  });
});
