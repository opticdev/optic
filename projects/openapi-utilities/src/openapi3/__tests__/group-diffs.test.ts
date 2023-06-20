import { test, expect, describe } from '@jest/globals';
import fs from 'node:fs/promises';
import { diff } from '../../diff/diff';
import { groupDiffsByEndpoint } from '../group-diff';

describe('groupDiffsByEndpoint', () => {
  test.each([
    [
      'small-pet-store',
      './inputs/openapi3/smallpetstore0.json',
      './inputs/openapi3/smallpetstore1.json',
    ],
  ])('can group diffs by endpoint for %s ', async (_, fromPath, toPath) => {
    const from = await fs
      .readFile(fromPath, 'utf-8')
      .then((f) => JSON.parse(f));
    const to = await fs.readFile(toPath, 'utf-8').then((f) => JSON.parse(f));

    const diffs = diff(from, to);

    expect(
      groupDiffsByEndpoint({ from, to }, diffs, [
        {
          where: 'blah',
          severity: 0,
          passed: false,
          location: {
            jsonPath: '/paths/~1user/post',
            spec: 'after',
          },
          name: 'info',
          type: 'requirement',
          error: 'should have been correct but was not',
        },
        {
          where: 'blah',
          severity: 1,
          passed: false,
          location: {
            jsonPath: '/paths/~1user/get',
            spec: 'after',
          },
          name: 'warn',
          type: 'requirement',
          error: 'should have been correct but was not',
        },
        {
          where: 'blah',
          severity: 2,
          passed: false,
          location: {
            jsonPath: '/paths/~1user/patch',
            spec: 'after',
          },
          name: 'error',
          type: 'requirement',
          error: 'should have been correct but was not',
        },
      ])
    ).toMatchSnapshot();
  });
});
