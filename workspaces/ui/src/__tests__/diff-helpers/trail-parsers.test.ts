import { makeUniverse } from './universes/makeUniverse';
import { ParsedDiff } from '../../engine/parse-diff';

const universe_raw = require('./universes/simple-todo/universe.json');

const universePromise = makeUniverse(universe_raw);

test('accurate spec trail for all diffs', async () => {
  const { rawDiffs, rfcBaseState } = await universePromise;

  const parsedDiffs = rawDiffs.map(
    ([diff, interactions]) => new ParsedDiff(diff, interactions)
  );

  parsedDiffs.forEach((i) => {
    expect(i.location(rfcBaseState)).toMatchSnapshot();
  });
});

// makeDiffRfcBaseState
