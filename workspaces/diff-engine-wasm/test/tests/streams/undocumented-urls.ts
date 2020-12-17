import Tap from 'tap';
import * as AT from '../../../src/async-tools';
import { DiffResults, UndocumentedUrls } from '../../../src/streams';

Tap.test('UndocumentedUrls.fromDiffResults', async (test) => {
  await test.test(
    'will yield undocumented urls with counts for UnmatchedRequestUrl diffs (by fingerprint)',
    async (t) => {
      const testDiffs: DiffResults.DiffResult[] = [
        [unmatchedRequestUrlDiff('/todos/1', 'GET'), ['interaction-1'], 'aaa'],
        [unmatchedRequestUrlDiff('/todos', 'GET'), ['interaction-2'], 'bbb'],
        [unmatchedRequestUrlDiff('/todos/1', 'GET'), ['interaction-3'], 'aaa'],
        [
          unmatchedRequestBodyShapeDiff('/todos/1', 'GET'),
          ['interaction-4'],
          'ccc',
        ],
        [unmatchedRequestUrlDiff('/todos', 'GET'), ['interaction-4'], 'bbb'],
      ];

      const undocumentedUrls = UndocumentedUrls.fromDiffResults(
        AT.from(testDiffs)
      );

      const results = await AT.toArray<UndocumentedUrls.UndocumentedUrl>(
        undocumentedUrls
      );

      t.deepEqual(results, [
        { path: '/todos/1', method: 'GET', count: 1, fingerprint: 'aaa' },
        { path: '/todos', method: 'GET', count: 1, fingerprint: 'bbb' },
        { path: '/todos/1', method: 'GET', count: 2, fingerprint: 'aaa' },
        { path: '/todos', method: 'GET', count: 2, fingerprint: 'bbb' },
      ]);
    }
  );
});

Tap.test('UndocumentedUrls.lastUnique', async (test) => {
  await test.test(
    'will only emit the last occurence of each undocumented url by fingerprint, in order of last key occurence',
    async (t) => {
      const testDiffs: DiffResults.DiffResult[] = [
        [unmatchedRequestUrlDiff('/todos/1', 'GET'), ['interaction-1'], 'aaa'],
        [unmatchedRequestUrlDiff('/todos', 'GET'), ['interaction-2'], 'bbb'],
        [unmatchedRequestUrlDiff('/todos', 'GET'), ['interaction-3'], 'bbb'],
        [unmatchedRequestUrlDiff('/todos/1', 'GET'), ['interaction-4'], 'aaa'],
      ];

      const undocumentedUrls = UndocumentedUrls.fromDiffResults(
        AT.from(testDiffs)
      );
      const lastUnique = UndocumentedUrls.lastUnique(undocumentedUrls);

      const results = await AT.toArray<UndocumentedUrls.UndocumentedUrl>(
        lastUnique
      );

      t.deepEqual(results, [
        { path: '/todos', method: 'GET', count: 2, fingerprint: 'bbb' },
        { path: '/todos/1', method: 'GET', count: 2, fingerprint: 'aaa' },
      ]);
    }
  );
});

// TODO: source this from a more representative place
function unmatchedRequestUrlDiff(
  path = '/api/f1/2019/2/constructors',
  method = 'GET'
) {
  return {
    UnmatchedRequestUrl: {
      interactionTrail: {
        path: [{ Url: { path } }, { Method: { method } }],
      },
      requestsTrail: { SpecRoot: {} },
    },
  };
}

function unmatchedRequestBodyShapeDiff(
  path = '/api/f1/2019/2/constructors',
  method = 'GET'
) {
  return {
    UnmatchedRequestBodyContentType: {
      interactionTrail: {
        path: [{ Url: { path } }, { Method: { method } }],
      },
      requestsTrail: { SpecPath: { pathId: 'path_H4JbNdDLJ1' } },
    },
  };
}
