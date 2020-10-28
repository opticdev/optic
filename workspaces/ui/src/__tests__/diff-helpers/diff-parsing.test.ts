/**
 * @jest-environment jsdom
 */

import { parseDiffsArray } from '../../engine/parse-diff';
import { DiffSet } from '../../engine/diff-set';

const diffs_raw = require('./universes/simple-todo/diffs.json');

test('parsing a set of diffs', () => {
  const allDiffs = parseDiffsArray(diffs_raw);
  expect(allDiffs).toMatchSnapshot();
});

test('can collect new region diffs', () => {
  const diffs = new DiffSet(parseDiffsArray(diffs_raw), null);
  diffs
    .newRegions()
    .iterator()
    .forEach((i) => {
      expect(i.raw).toMatchSnapshot();
    });
});

test('can collect shape diffs diffs', () => {
  const diffs = new DiffSet(parseDiffsArray(diffs_raw), null);
  diffs
    .shapeDiffs()
    .iterator()
    .forEach((i) => {
      expect(i.raw).toMatchSnapshot();
    });
});
