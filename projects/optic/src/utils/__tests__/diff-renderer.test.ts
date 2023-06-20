import { test, expect, describe } from '@jest/globals';
import { generateComparisonLogsV2 } from '../diff-renderer';
import {
  Severity,
  groupDiffsByEndpoint,
  diff,
} from '@useoptic/openapi-utilities';
import { parseOpenAPIWithSourcemap } from '@useoptic/openapi-io';
import { RuleResult } from '@useoptic/openapi-utilities/src';
import path from 'path';

describe('generateComparisonLogsV2', () => {
  test('renders results', async () => {
    const from = await parseOpenAPIWithSourcemap(
      path.resolve('./specs/smallpetstore0.json')
    );

    const to = await parseOpenAPIWithSourcemap(
      path.resolve('./specs/smallpetstore1.json')
    );

    const diffs = diff(from, to);
    const groupedDiffs = groupDiffsByEndpoint(
      { from: from.jsonLike, to: to.jsonLike },
      diffs,
      []
    );
    const results: RuleResult[] = [
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
    ];

    const all: string[] = [];
    for (const log of generateComparisonLogsV2(
      groupedDiffs,
      { from: from.sourcemap, to: to.sourcemap },
      {
        results,
        diffs,
      },
      {
        output: 'pretty',
        verbose: false,
        severity: Severity.Error,
      }
    )) {
      all.push(log.replace(process.cwd(), ''));
    }
    expect(all).toMatchSnapshot();
  });
});
