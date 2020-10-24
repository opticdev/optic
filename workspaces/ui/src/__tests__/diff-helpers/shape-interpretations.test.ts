import { shapeDiffPreview, testCase } from './fixture';
import fs from 'fs';
const cases = testCase('shape-diff-engine');

test('a known field is missing.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions).toMatchSnapshot();
});

test('a known field is provided the wrong shape.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions).toMatchSnapshot();
});

test('a new field is provided as an array with any contents.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  console.log(JSON.stringify(preview.suggestions));
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('a new field is provided as an empty array.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('a new field is provided in a required nested object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('a new field is provided in an optional nested object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('a primitive type is provided to an optional object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('a required array field has no items, no diff.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('a required array field is an object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('a required array field of strings provided with an object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('an array type is provided to an optional object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('an extra field is provided as an object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('an extra field is provided.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('an required object field is null, suggests nullable.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('an required object field is ommitted.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('an required object field is provided with a missing required field.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('an required object field is provided with an array.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('array unknown is provided with concrete values.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('array unknown is provided with no values.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('array with object listitem is provided an empty sub array.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('array with object listitem is provided an sub array of numbers.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('array with object listitem is provided with no values.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('array with object listitem is provided with one matching and one primitive.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('array with object listitem is provided with one matching, no diff.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('deeply nested fields inside of arrays.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('field is array of strings, and 1 item does not match expected type.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('field is array of strings, and > 1 items does not match expected type.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('no diff expected for basic objects.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('required fields are omitted in an optional object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('root array is provided with object.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});

test('when a nullable is provided with a concrete type.managed', async () => {
  const universe = await cases(expect.getState().currentTestName);
  const diff = universe.diffs.groupedByEndpointAndShapeTrail()[0];
  const preview = await shapeDiffPreview(diff, universe);
  expect(preview.suggestions.length).toBeGreaterThan(0);
});
