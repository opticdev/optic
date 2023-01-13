import { test, expect, describe } from '@jest/globals';
import fs from 'node:fs/promises';
import { OpenApiV3Traverser, getLocation, getRaw } from '../traverser';

describe('traversing a spec', () => {
  test.each([
    ['./inputs/openapi3/smallpetstore0.json'],
    ['./inputs/openapi3/smallpetstore1.json'],
    ['./inputs/openapi3/polymorphic-schemas.json'],
    ['./inputs/openapi3/polymorphic-schemas-3_1.json'],
  ])('can traverse a spec (%s)', async (fileName) => {
    const spec = await fs
      .readFile(fileName, 'utf-8')
      .then((f) => JSON.parse(f));
    const traverser = new OpenApiV3Traverser();
    traverser.traverse(spec);
    expect([...traverser.facts()]).toMatchSnapshot();
  });
});

describe.each([
  ['specification', ''],
  ['operation', '/paths/~1user/post'],
  ['requestBody', '/paths/~1user/post/requestBody'],
  ['response', '/paths/~1user/post/responses/default'],
  [
    'response-header',
    '/paths/~1user~1login/get/responses/200/headers/X-Rate-Limit',
  ],
  ['request-query', '/paths/~1user~1login/get/parameters/1'],
  [
    'field',
    '/paths/~1user~1login/get/responses/200/content/application~1xml/schema/properties/id',
  ],
])('interpreters for %s', (type, jsonPath) => {
  test('can get raw fact details', async () => {
    const spec = await fs
      .readFile('./inputs/openapi3/smallpetstore1.json', 'utf-8')
      .then((f) => JSON.parse(f));
    const traverser = new OpenApiV3Traverser();
    traverser.traverse(spec);

    expect(
      getRaw(spec, {
        location: {
          jsonPath,
        },
        type: type,
      } as any)
    ).toMatchSnapshot();
  });

  test('get locations from json paths', async () => {
    expect(
      getLocation({
        location: {
          jsonPath,
        },
        type: type,
      } as any)
    ).toMatchSnapshot();
  });
});
