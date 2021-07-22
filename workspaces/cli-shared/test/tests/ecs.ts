// Getting the Typescript compiler to find these in cli-shared/typings through
// passing it a tsconfig has been successful :(
/// <reference types="../../typings/stream-chain/index" />
/// <reference types="../../typings/stream-json/index" />
import Tap from 'tap';
import Path from 'path';
import Fs from 'fs-extra';
import { ecsToHttpInteraction } from '../../build/ingest/ecs-to-sample';

Tap.test('ecs to interactions', async (test) => {
  const inputDir = Path.join(__dirname, '../fixtures/ecs-examples');
  const examples = Fs.readdirSync(
    Path.join(__dirname, '../fixtures/ecs-examples')
  ).map((i) => [Path.basename(i, '.json'), require(Path.join(inputDir, i))]);

  examples.forEach((example) => {
    const [name, value] = example;
    test.matchSnapshot(ecsToHttpInteraction(value, name), `ecs-${name}`);
  });
});
