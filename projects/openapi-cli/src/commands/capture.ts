import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';
import readline from 'readline';
import { AbortController } from 'node-abort-controller';
import { Writable } from 'stream';
import * as AT from '../lib/async-tools';

import {
  CapturedInteraction,
  CapturedInteractions,
  HarEntries,
  HttpArchive,
  ProxyInteractions,
} from '../captures/index';

export function captureCommand(): Command {
  const command = new Command('capture');

  command
    .description('capture observed traffic as a HAR (HttpArchive v1.3) file')
    .option('--har <har-file>', 'path to HttpArchive file (v1.2, v1.3)')
    .option(
      '--proxy <target-url>',
      'accept traffic over a proxy targeting the actual service'
    )
    .option('-o <output-file>', 'file name for output')
    .action(async () => {
      const options = command.opts();

      let sourcesController = new AbortController();
      const sources: HarEntries[] = []; // this should be CapturedInteractions, but those aren't detailed enough yet to not lose information later
      let interactiveCapture = false;

      if (options.har) {
        let absoluteHarPath = Path.resolve(options.har);
        if (!(await fs.pathExists(absoluteHarPath))) {
          return command.error('Har file could not be found at given path');
        }
        let harFile = fs.createReadStream(absoluteHarPath);
        let harEntries = HarEntries.fromReadable(harFile);
        sources.push(harEntries);
      }

      if (options.proxy) {
        if (!process.stdin.isTTY) {
          return command.error(
            'Can only use --proxy when in an interactive terminal session'
          );
        }

        let [proxyInteractions, proxyUrl] = await ProxyInteractions.create(
          options.proxy,
          sourcesController.signal
        );
        sources.push(HarEntries.fromProxyInteractions(proxyInteractions));
        console.error(
          `Proxy created. Redirect traffic you want to capture to ${proxyUrl}`
        );
        interactiveCapture = true;
      }

      if (sources.length < 1) {
        command.showHelpAfterError(true);
        return command.error(
          'Choose a capture method to update spec by traffic'
        );
      }

      const harEntries = AT.merge(...sources);

      const observations = writeInteractions(harEntries, process.stdout);

      const handleUserSignals = (async function () {
        if (interactiveCapture && process.stdin.isTTY) {
          // wait for an empty new line on input, which should indicate hitting Enter / Return
          let lines = readline.createInterface({ input: process.stdin });
          for await (let line of lines) {
            if (line.trim().length === 0) {
              lines.close();
              readline.moveCursor(process.stdin, 0, -1);
              readline.clearLine(process.stdin, 1);
              sourcesController.abort();
            }
          }
        }
      })();

      const renderingStats = renderCaptureProgress(observations);

      await Promise.all([handleUserSignals, renderingStats]);
    });

  return command;
}

function writeInteractions(
  harEntries: HarEntries,
  destination: Writable & { fd?: number }
): CaptureObservations {
  const observing = new AT.Subject<CaptureObservation>();
  const observers = {
    captureHarEntry(entry: HttpArchive.Entry) {
      const interaction = CapturedInteraction.fromHarEntry(entry); // inefficient, but okay until CapturedInteraction becomes the common source type
      observing.onNext({
        kind: CaptureObservationKind.InteractionCaptured,
        path: interaction.request.path,
        method: interaction.request.method,
      });
    },
  };

  let harJSON = HarEntries.toHarJSON(
    AT.tap(observers.captureHarEntry)(harEntries)
  );

  function onWriteComplete() {
    observing.onNext({
      kind: CaptureObservationKind.CaptureWritten,
    });
    observing.onCompleted();
  }

  if (destination.fd == 1) {
    // if writing to stdout
    // stdout won't close until the process detaches, so we can't use it to measure completion
    harJSON.once('end', onWriteComplete);
  } else {
    destination.once('end', onWriteComplete);
  }

  harJSON.pipe(destination);

  return observing.iterator;
}

export enum CaptureObservationKind {
  InteractionCaptured = 'interaction-captured',
  CaptureWritten = 'capture-written',
}

export type CaptureObservation = {
  kind: CaptureObservationKind;
} & (
  | {
      kind: CaptureObservationKind.InteractionCaptured;
      path: string;
      method: string;
    }
  | {
      kind: CaptureObservationKind.CaptureWritten;
    }
);

export interface CaptureObservations
  extends AsyncIterable<CaptureObservation> {}

async function renderCaptureProgress(observations: CaptureObservations) {
  const chalk = (await import('chalk')).default;

  let interactionCount = 0;

  console.error('> Waiting for first request');

  for await (let observation of observations) {
    if (observation.kind === CaptureObservationKind.InteractionCaptured) {
      interactionCount += 1;
      if (interactionCount === 1) {
        console.error(`> First request captured`);
      }
    } else if (observation.kind === CaptureObservationKind.CaptureWritten) {
      console.error('> Capture written succesfully');
    }
  }

  if (interactionCount === 0) {
    console.error('⚠️  No requests captured');
  } else {
    console.error(`✅ Captured ${interactionCount} requests`);
  }
}
