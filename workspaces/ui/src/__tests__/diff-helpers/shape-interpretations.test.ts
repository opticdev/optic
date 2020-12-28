import {
  canApplySuggestions,
  logResult,
  shapeDiffPreview,
  testCase,
} from './fixture';
const cases = testCase('shape-diff-engine');

test('a known field is missing.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('a known field is provided the wrong shape.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('a new field is provided as an array with any contents.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('a new field is provided as an empty array.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('a new field is provided in a required nested object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('a new field is provided in an optional nested object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('a primitive type is provided to an optional object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  logResult(preview);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('a required array field has no items, no diff.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  expect(diff).toBeUndefined();
});

test('a required array field is an object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('a required array field of strings provided with an object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('an array type is provided to an optional object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('an extra field is provided as an object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('an extra field is provided.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('an required object field is null, suggests nullable.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('an required object field is ommitted.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('an required object field is provided with a missing required field.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('an required object field is provided with an array.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});
// THIS IS WRONG. IN THE DIFF ENGINE. PRODUCES NO DIFF
// test('array unknown is provided with concrete values.managed', async () => {
//   const universe = await cases(expect.getState().currentTestName);
//   const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
//   const preview = await shapeDiffPreview(diff, universe);
//   logResult(preview);
//   expect(preview.suggestions.length).toBeGreaterThan(0);
// });
//
test('array unknown is provided with no values.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  expect(universe.diffs.count()).toBe(0);
});

test('array with object listitem is provided an empty sub array.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('array with object listitem is provided an sub array of numbers.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('array with object listitem is provided with no values.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  expect(universe.diffs.count()).toBe(0);
});

test('array with object listitem is provided with one matching and one primitive.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('array with object listitem is provided with one matching, no diff.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  expect(universe.diffs.count()).toBe(0);
});

test('deeply nested fields inside of arrays.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('field is array of strings, and 1 item does not match expected type.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('field is array of strings, and more than 1 items does not match expected type.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('no diff expected for basic objects.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  expect(universe.diffs.count()).toBe(0);
});

test('required fields are omitted in an optional object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
});

test('root array is provided with object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});

test('when a nullable is provided with a concrete type.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview).toMatchSnapshot();
  expect(
    await canApplySuggestions(preview.suggestions, universe)
  ).toMatchSnapshot();
});
