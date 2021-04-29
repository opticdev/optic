// Getting the Typescript compiler to find these in cli-shared/typings through
// passing it a tsconfig has been successful :(
/// <reference types="../../typings/stream-chain/index" />
/// <reference types="../../typings/stream-json/index" />

import Tap from 'tap';
import { FileSystemAvroCaptureSaver as CaptureSaver } from '@useoptic/cli-shared';
import { IHttpInteraction as Interaction } from '@useoptic/domain-types';
import { exampleInteractions } from '../fixtures/interactions';
import Path from 'path';
import Fs from 'fs-extra';
import { Readable, Transform, TransformCallback } from 'stream';
import { InteractionDiffWorkerRust } from '../../src/diffs/interaction-diff-worker-rust';

Tap.test('diff-worker-rust', async (test) => {
  await test.test('can diff a capture against a spec', async (t) => {
    const diffConfig = await prepare(
      exampleInteractions(100),
      Path.join(__dirname, '..', 'fixtures', 'example-events.json')
    );

    const worker = new InteractionDiffWorkerRust({
      ...diffConfig,
      events: await Fs.readJson(diffConfig.specFilePath),
      ignoreRules: await Fs.readJson(diffConfig.ignoreRequestsFilePath),
    });
    const output = await worker.run();
    const streamToString = new Transform({
      writableObjectMode: true,
      readableObjectMode: false,
      transform(chunk: any, encoding: string, callback: TransformCallback) {
        callback(null, JSON.stringify(chunk) + '\n');
      },
    });
    Readable.from(output.results).pipe(streamToString).pipe(process.stdout);
  });

  // await test.test(
  //   'will propagate errors in parsing spec from the diff engine',
  //   async (t) => {
  //     const diffConfig = await prepare(
  //       exampleInteractions(10),
  //       // this will fail, because interactions aren't a valid spec file
  //       Path.join(__dirname, '..', 'fixtures', 'example-interaction.json')
  //     );
  //
  //     const worker = new DiffWorkerRust(diffConfig);
  //     const rejecting = t.rejects(
  //       new Promise((_, reject) => {
  //         worker.events.once('error', reject);
  //       })
  //     );
  //     await worker.start();
  //
  //     await rejecting;
  //   }
  // );
  //
  // await test.test(
  //   'will propagate errors in diffing an interaction from the diff engine',
  //   async (t) => {
  //     const specPath = Path.join(
  //       __dirname,
  //       '..',
  //       'fixtures',
  //       'unsupported-reference-base-shapes',
  //       'events.json'
  //     );
  //     const interactionPath = Path.join(
  //       __dirname,
  //       '..',
  //       'fixtures',
  //       'unsupported-reference-base-shapes',
  //       'interaction.json'
  //     );
  //
  //     const diffConfig = await prepare(
  //       exampleInteractions(1, interactionPath),
  //       specPath
  //     );
  //
  //     const worker = new DiffWorkerRust(diffConfig);
  //     const rejecting = t.rejects(
  //       new Promise((_, reject) => {
  //         worker.events.once('error', reject);
  //       })
  //     );
  //
  //     await worker.start();
  //     await rejecting;
  //   }
  // );
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

  await Fs.emptyDir(Path.join(captureBaseDirectory, captureId));

  const captureSaver = new CaptureSaver({
    captureBaseDirectory,
    captureId,
  });
  await captureSaver.init();

  for await (let interaction of interactions) {
    captureSaver.save(interaction);
  }

  await captureSaver.cleanup();

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
