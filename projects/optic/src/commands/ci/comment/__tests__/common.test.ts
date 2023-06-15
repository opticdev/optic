import { describe, test, expect } from '@jest/globals';
import { generateCompareSummaryMarkdown } from '../common';
import type { CiRunDetails } from '../../../../utils/ci-data';
import {
  defaultEmptySpec,
  diff,
  groupDiffsByEndpoint,
} from '@useoptic/openapi-utilities';

const from = defaultEmptySpec;
const to = {
  ...defaultEmptySpec,
  paths: {
    '/api': {
      get: {
        responses: {
          '200': {
            description: 'hello',
          },
        },
      },
    },
  },
};

const input: CiRunDetails = {
  completed: [
    {
      apiName: 'completed',
      opticWebUrl: 'https://app.useoptic.com/changelog',
      specUrl: 'https://app.useoptic.com/docs',
      warnings: [],
      comparison: {
        groupedDiffs: groupDiffsByEndpoint(
          {
            from,
            to,
          },
          diff(from, to),
          []
        ),
        results: [],
      },
    },
  ],
  failed: [
    {
      apiName: 'failed',
      error: 'blahblahblah',
    },
  ],
  noop: [
    {
      apiName: 'noop',
    },
  ],
  severity: 2,
};
describe('generateCompareSummaryMarkdown', () => {
  test('generates md output for passed, failed and noop', () => {
    expect(
      generateCompareSummaryMarkdown({ sha: '123' }, input)
    ).toMatchSnapshot();
  });

  test('only passed', () => {
    expect(
      generateCompareSummaryMarkdown(
        { sha: '123' },
        {
          completed: input.completed,
          failed: [],
          noop: [],
          severity: 2,
        }
      )
    ).toMatchSnapshot();
  });

  test('only failed', () => {
    expect(
      generateCompareSummaryMarkdown(
        { sha: '123' },
        {
          completed: [],
          failed: input.failed,
          noop: [],
          severity: 2,
        }
      )
    ).toMatchSnapshot();
  });

  test('only noop', () => {
    expect(
      generateCompareSummaryMarkdown(
        { sha: '123' },
        {
          completed: [],
          failed: [],
          noop: input.noop,
          severity: 2,
        }
      )
    ).toMatchSnapshot();
  });

  test('when run without optic cloud', () => {
    expect(
      generateCompareSummaryMarkdown(
        { sha: '123' },
        {
          completed: [
            {
              apiName: 'no-optic-cloud',
              warnings: [],
              comparison: {
                groupedDiffs: groupDiffsByEndpoint(
                  {
                    from,
                    to,
                  },
                  diff(from, to),
                  []
                ),
                results: [],
              },
            },
          ],
          failed: [],
          noop: [],
          severity: 2,
        }
      )
    ).toMatchSnapshot();
  });
});
