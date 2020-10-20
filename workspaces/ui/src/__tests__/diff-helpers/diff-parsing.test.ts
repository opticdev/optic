/**
 * @jest-environment jsdom
 */

import { parseDiffsArray } from '../../engine/parse-diff';
import { DiffSet } from '../../engine/diff-set';

const diffs_raw = require('./tododiffs.json');

test('parsing a set of diffs', () => {
  const allDiffs = parseDiffsArray(diffs_raw);
  expect(allDiffs).toMatchSnapshot();
});

test('can collect new region diffs', () => {
  const diffs = new DiffSet(parseDiffsArray(diffs_raw));
  diffs
    .shapeDiffs()
    .iterator()
    .forEach((i) => {
      expect(i.raw).toMatchSnapshot();
    });
});
