import { makeUniverse } from './universes/makeUniverse';

const universe_raw = require('./universes/simple-todo/universe.json');

const universePromise = makeUniverse(universe_raw);

test('simulated capture service can run in tests', async () => {
  const { captureServiceFactory } = await universePromise;
  const captureService = await captureServiceFactory();

  const example = universe_raw.session.samples[0].uuid;
  expect(await captureService.loadInteraction(example)).toMatchSnapshot();
});

test('simulated diff service can start a diff', async () => {
  const { rawDiffs } = await universePromise;
  expect(JSON.stringify(rawDiffs)).toMatchSnapshot();
});
