import { newRegionPreview, testCase } from './fixture';

// TODO remove this and figure out how to deterministically set the seed in rust id generation
// This means we aren't checking for IDs in our snapshots
const removeIdsFromSnapshot = <T extends any>(unprocessed: T): T => {
  const keysToRemove = new Set([
    'requestId',
    'responseId',
    'shapeId',
    'fieldId',
  ]);

  const processValue = (innerValue: any): any => {
    if (Array.isArray(innerValue)) {
      return innerValue.map((v) => processValue(v));
    } else if (typeof innerValue === 'object') {
      const processed: any = {};
      for (const [key, v] of Object.entries(innerValue)) {
        if (!keysToRemove.has(key)) {
          processed[key] = processValue(v);
        }
      }
      return processed;
    } else {
      return innerValue;
    }
  };

  return processValue(unprocessed);
};

test('empty spec produced no body diffs', async () => {
  const universe = await testCase('empty-todo')('universe');
  const diffs = universe.diffSet.groupedByEndpointAndShapeTrail();
  expect(diffs.length).toBe(0);
});

test('spec with paths, and new bodies', async () => {
  const universe = await testCase('simple-todo')('partial-universe');
  const diffs = universe.diffSet.newRegions().groupedByEndpoint();

  expect(diffs).toMatchSnapshot();
});

test('new request body has correct commands', async () => {
  const universe = await testCase('simple-todo')('partial-universe');
  const diffs = universe.diffSet.newRegions().iterator();

  const diffService = await universe.universe.opticContext.diffRepository.findById(
    '123'
  );

  const preview = await newRegionPreview(
    diffs.find((i) => i.diffHash === '41bb570841f9d23b')!,
    diffService,
    universe.universe
  );

  expect(removeIdsFromSnapshot(preview)).toMatchSnapshot();
});

test('new response body has correct commands', async () => {
  const universe = await testCase('simple-todo')('partial-universe');
  const diffs = universe.diffSet.newRegions().iterator();

  const diffService = await universe.universe.opticContext.diffRepository.findById(
    '123'
  );

  const preview = await newRegionPreview(
    diffs.find((i) => i.diffHash === '2d42a681976a8151')!,
    diffService,
    universe.universe
  );

  expect(removeIdsFromSnapshot(preview)).toMatchSnapshot();
});
