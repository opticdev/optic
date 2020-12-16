import { newRegionPreview, testCase } from './fixture';

test('empty spec produced no body diffs', async () => {
  const empty = testCase('empty-todo')('universe');
  const universe = await empty;
  const diffs = universe.diffs.groupedByEndpointAndShapeTrail();

  expect(diffs.length).toBe(0);
  // const preview = await shapeDiffPreview(diff, universe);
  // console.log(preview);
});

const newBodyRegions = testCase('simple-todo')('partial-universe');

test('spec with paths, and new bodies', async () => {
  const universe = await newBodyRegions;
  const diffs = universe.diffs.newRegions().groupedByEndpoint();

  expect(diffs).toMatchSnapshot();
});

test('new request body has correct commands', async () => {
  const universe = await newBodyRegions;
  const diffs = universe.diffs
    .newRegions()
    .iterator()
    .filter((i) => i.location(universe.rfcBaseState).inRequest);

  const preview = await newRegionPreview(diffs[0], universe);

  expect(preview).toMatchSnapshot();
});

test('new response body has correct commands', async () => {
  const universe = await newBodyRegions;
  const diffs = universe.diffs
    .newRegions()
    .iterator()
    .filter((i) => i.location(universe.rfcBaseState).inResponse);

  const preview = await newRegionPreview(diffs[0], universe);
  expect(preview).toMatchSnapshot();
});
