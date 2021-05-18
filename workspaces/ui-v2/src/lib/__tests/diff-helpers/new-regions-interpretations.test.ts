import { newRegionPreview, testCase } from './fixture';

// TODO remove this and figure out how to deterministically set the seed in rust id generation
// This means we aren't checking for IDs in our snapshots
const removeIdsFromSnapshot = <T extends Record<string, any>>(
  unprocessed: T
): T => {
  const keysToRemove = new Set([
    'requestId',
    'responseId',
    'shapeId',
    'fieldId',
  ]);

  const processed: any = {};
  for (const [key, value] of Object.entries(unprocessed)) {
    if (!keysToRemove.has(key)) {
      if (Array.isArray(value)) {
        processed[key] = value.map(removeIdsFromSnapshot);
      } else if (typeof value === 'object') {
        processed[key] = removeIdsFromSnapshot(value);
      } else {
        processed[key] = value;
      }
    }
  }

  return processed;
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
