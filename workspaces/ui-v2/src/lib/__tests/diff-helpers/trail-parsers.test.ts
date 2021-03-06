import { ParsedDiff } from '<src>/lib/parse-diff';
import { buildUniverse } from '<src>/lib/__tests/diff-helpers/universes/buildUniverse';

test('accurate spec trail for all diffs', async () => {
  const { opticContext, currentSpecContext } = await buildUniverse(
    require('./universes/simple-todo/universe.json')
  );
  const started = await opticContext.capturesService.startDiff(
    '123',
    'example-session'
  );
  await started.onComplete;

  const result = await opticContext.diffRepository.findById('123');
  const diffs = (await result.listDiffs()).diffs;

  const parsedDiffs = diffs.map(
    ([diff, interactions, fingerprint]: any) =>
      new ParsedDiff(diff, interactions, fingerprint)
  );

  parsedDiffs.forEach((i: ParsedDiff) => {
    expect(i).toMatchSnapshot(i.diffHash + '-parsed');
    expect(i.location(currentSpecContext)).toMatchSnapshot(
      i.diffHash + '-parsed-location'
    );
  });
});
