import { makeUniverse } from './universes/makeUniverse';
import { makeDiffRfcBaseState } from '../../engine/interfaces/diff-rfc-base-state';
import { ParsedDiff } from '../../engine/parse-diff';

const universe_raw = require('./universes/simple-todo/universe.json');

const universePromise = makeUniverse(universe_raw);

test('accurate spec trail for all diffs', async () => {
  const { captureService, diffService, rfcBaseState } = await universePromise;
  const diffsRaw = (await diffService.listDiffs()).rawDiffs;

  const parsedDiffs = diffsRaw.map(
    ([diff, interactions]) => new ParsedDiff(diff, interactions)
  );

  parsedDiffs.forEach((i) =>
    expect(i.location(rfcBaseState)).toMatchSnapshot()
  );
});

// makeDiffRfcBaseState
