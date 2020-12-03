// Getting the Typescript compiler to find these in cli-shared/typings through
// passing it a tsconfig has been successful :(
/// <reference types="../../typings/stream-chain/index" />
/// <reference types="../../typings/stream-json/index" />

import Tap from 'tap';
import { DiffWorkerRust } from '../../src/diffs/diff-worker-rust';
import { FileSystemAvroCaptureSaver as CaptureSaver } from '@useoptic/cli-shared';
import { IHttpInteraction as Interaction } from '@useoptic/domain-types';
import { exampleInteractions } from '../fixtures/interactions';
import Path from 'path';
import Fs from 'fs-extra';

Tap.test('diff-worker-rust', async (test) => {
  await test.test('can diff a capture against a spec', async (t) => {
    let diffConfig = await prepare(
      exampleInteractions(),
      Path.join(__dirname, '..', 'fixtures', 'example-events.json')
    );

    await new DiffWorkerRust(diffConfig).run();
  });

  await test.test('will propagate errors from the diff engine');
});

async function prepare(
  interactions: AsyncIterable<Interaction>,
  eventsPath: string,
  diffId: string = 'test-diff'
) {
  if (!Fs.existsSync(eventsPath)) {
    throw new Error(
      'eventsPath must be valid path to spec events file to prepare a diff for the diff-worker test'
    );
  }
  const captureBaseDirectory = __dirname;
  const captureId = 'diff-worker-test-capture';

  const captureSaver = new CaptureSaver({
    captureBaseDirectory,
    captureId,
  });
  await captureSaver.init();

  for await (let interaction of interactions) {
    captureSaver.save(interaction);
  }

  // prepare output
  const outputBaseDir = Path.join(captureBaseDirectory, captureId, 'diffs');
  const outputDir = Path.join(outputBaseDir, diffId);
  if (Fs.existsSync(outputBaseDir)) {
    Fs.removeSync(outputBaseDir);
  }
  Fs.mkdirpSync(Path.join(outputDir));
  Fs.copySync(
    Path.join(__dirname, '..', 'fixtures', 'diff-worker-output-base'),
    outputDir
  );
  Fs.copyFileSync(eventsPath, Path.join(outputDir, 'events.json'));

  const diffConfig = {
    captureId,
    captureBaseDirectory,
    diffId,
    specFilePath: Path.join(outputDir, 'events.json'),
    ignoreRequestsFilePath: Path.join(outputDir, 'ignoreRequests.json'),
    additionalCommandsFilePath: Path.join(outputDir, 'additionalCommands.json'),
    filtersFilePath: Path.join(outputDir, 'filters.json'),
  };

  return diffConfig;
}
