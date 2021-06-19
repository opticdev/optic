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
  ).map((i) => require(Path.join(inputDir, i)));

  examples.forEach((i, index) => {
    test.matchSnapshot(ecsToHttpInteraction(i), 'ecs-' + index + 1);
  });
});
