import { test, expect, describe } from '@jest/globals';
import {
  constructFactTree,
  getFactForJsonPath,
} from '../json-path-interpreters';
import { FactsMock } from './fact-mock';

describe('constructFactTree', () => {
  test('constructs a fact tree from facts', async () => {
    expect(constructFactTree(FactsMock)).toMatchSnapshot();
  });
});

describe('getFactForJsonPath', () => {
  test('returns the relevant fact for a json path', () => {
    const factTree = constructFactTree(FactsMock);
    expect(getFactForJsonPath('/info/title', factTree)?.location.jsonPath).toBe(
      ''
    );
    expect(
      getFactForJsonPath(
        '/paths/~1user~1{username}/delete/responses/400/description',
        factTree
      )?.location.jsonPath
    ).toBe('/paths/~1user~1{username}/delete/responses/400');

    expect(
      getFactForJsonPath(
        '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/userStatus/type',
        factTree
      )?.location.jsonPath
    ).toBe(
      '/paths/~1user~1{username}/put/requestBody/content/*~1*/schema/properties/userStatus'
    );
  });
});
