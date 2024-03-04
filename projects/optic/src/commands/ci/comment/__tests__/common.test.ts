import { describe, test, expect } from '@jest/globals';
import { generateCompareSummaryMarkdown } from '../common';
import type { CiRunDetails } from '../../../../utils/ci-data';
import {
  defaultEmptySpec,
  diff,
  groupDiffsByEndpoint,
} from '@useoptic/openapi-utilities';
import { FlatOpenAPIV3 } from '@useoptic/openapi-utilities/src';

const from: FlatOpenAPIV3.Document = defaultEmptySpec as FlatOpenAPIV3.Document;
const to: FlatOpenAPIV3.Document = {
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
      post: {
        responses: {
          '200': {
            description: 'hello',
          },
        },
      },
    },
  },
} as FlatOpenAPIV3.Document;

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
      generateCompareSummaryMarkdown({ sha: '123' }, input, {
        verbose: false,
      })
    ).toMatchSnapshot();
  });

  test('generates md output for passed, failed and noop for verbose', () => {
    expect(
      generateCompareSummaryMarkdown({ sha: '123' }, input, {
        verbose: true,
      })
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
        },
        {
          verbose: false,
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
        },
        {
          verbose: false,
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
        },
        {
          verbose: false,
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
        },
        {
          verbose: false,
        }
      )
    ).toMatchSnapshot();
  });
});
