import { newRegionPreview, testCase } from './fixture';

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
//
test('new request body has correct commands', async () => {
  const universe = await testCase('simple-todo')('partial-universe');
  const diffs = universe.diffSet
    .newRegions()
    .iterator()
    .filter((i) => i.location(universe.universe.currentSpecContext).inRequest);

  const diffService = await universe.universe.opticContext.diffRepository.findById(
    '123'
  );

  const newRegion = await newRegionPreview(
    diffs[0],
    diffService,
    universe.universe
  );

  console.log(newRegion);
  console.log(diffs);
  // const preview = await newRegionPreview(diffs[0], universe);

  // expect(preview).toMatchSnapshot();
});
//
// test('new response body has correct commands', async () => {
//   const universe = await testCase('simple-todo')('partial-universe');
//   const diffs = universe.diffs
//     .newRegions()
//     .iterator()
//     .filter((i) => i.location(universe.rfcBaseState).inResponse);
//
//   const preview = await newRegionPreview(diffs[0], universe);
//   expect(preview).toMatchSnapshot();
// });
