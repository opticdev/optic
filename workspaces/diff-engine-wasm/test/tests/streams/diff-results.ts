import Tap from 'tap';
import * as AT from '../../../src/async-tools';
import { DiffResults } from '../../../src/streams';

Tap.test('DiffResults.normalize', async (test) => {
  await test.test(
    'will group diff results by their fingerprint and concat tags',
    async (t) => {
      const testDiff = await createExampleDiff();

      const testDiffs: DiffResults.DiffResult[] = [
        [testDiff, ['interaction-1'], 'aaa'],
        [testDiff, ['interaction-2'], 'bbb'],
        [testDiff, ['interaction-3'], 'aaa'],
        [testDiff, ['interaction-4'], 'ccc'],
      ];

      const normalized = DiffResults.normalize(AT.from(testDiffs));

      const results = await AT.toArray<DiffResults.DiffResult>(normalized);

      t.deepEqual(results, [
        [testDiff, ['interaction-1'], 'aaa'],
        [testDiff, ['interaction-2'], 'bbb'],
        [testDiff, ['interaction-1', 'interaction-3'], 'aaa'],
        [testDiff, ['interaction-4'], 'ccc'],
      ]);
    }
  );
});

Tap.test('DiffResults.lastUnique', async (t) => {
  await t.test(
    'will only emit the last occurence of each result by fingerprint, in order of last key occurence',
    async (t) => {
      const testDiff = await createExampleDiff();

      const testDiffs: DiffResults.DiffResult[] = [
        [testDiff, ['interaction-1'], 'aaa'],
        [testDiff, ['interaction-2'], 'bbb'],
        [testDiff, ['interaction-3'], 'aaa'],
        [testDiff, ['interaction-4'], 'ccc'],
      ];

      const normalized = DiffResults.lastUnique(AT.from(testDiffs));

      const results = await AT.toArray<DiffResults.DiffResult>(normalized);

      t.deepEqual(results, [
        [testDiff, ['interaction-2'], 'bbb'],
        [testDiff, ['interaction-3'], 'aaa'],
        [testDiff, ['interaction-4'], 'ccc'],
      ]);
    }
  );
});

// TODO: source this from a more representative place
async function createExampleDiff() {
  return { UnmatchedRequestUrl: {} };
}
