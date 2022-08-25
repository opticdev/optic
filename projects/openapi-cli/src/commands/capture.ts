import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';
import readline from 'readline';
import { AbortController, AbortSignal } from 'node-abort-controller';
import { Writable } from 'stream';
import exitHook from 'async-exit-hook';
import * as AT from '../lib/async-tools';
import { createCommandFeedback, InputErrors } from './reporters/feedback';
import { trackCompletion } from '../segment';
import { trackWarning } from '../sentry';
import Conf from 'conf';

import {
  CapturedInteraction,
  CapturedInteractions,
  HarEntries,
  HttpArchive,
  ProxyInteractions,
} from '../captures/index';
import { ProxyCertAuthority } from '../captures/streams/sources/proxy';
import { config } from 'process';

export async function captureCommand(): Promise<Command> {
  const command = new Command('capture');

  const feedback = await createCommandFeedback(command);

  command
    .description('capture observed traffic as a HAR (HttpArchive v1.3) file')
    .argument(
      '[file-path]',
      'path of the new capture file (written to stdout when not provided)'
    )
    .option('--har <har-file>', 'path to HttpArchive file (v1.2, v1.3)')
    .option(
      '--proxy <target-url>',
      'accept traffic over a proxy targeting the actual service'
    )
    .option('-o <output-file>', 'file name for output')
    .option('--ca <output-file>', 'file name to write CA certificate to')
    .action(async (filePath?: string) => {
      const options = command.opts();

      let sourcesController = new AbortController();
      const sources: HarEntries[] = []; // this should be CapturedInteractions, but those aren't detailed enough yet to not lose information later
      let interactiveCapture = false;

      if (options.har) {
        let absoluteHarPath = Path.resolve(options.har);
        if (!(await fs.pathExists(absoluteHarPath))) {
          return await feedback.inputError(
            'HAR file could not be found at given path',
            InputErrors.HAR_FILE_NOT_FOUND
          );
        }
        let harFile = fs.createReadStream(absoluteHarPath);
        let harEntryResults = HarEntries.fromReadable(harFile);
        let harEntries = AT.unwrapOr(harEntryResults, (err) => {
          let message = `HAR entry skipped: ${err.message}`;
          console.warn(message); // warn, skip and keep going
          trackWarning(message, err);
        });
        sources.push(harEntries);
      }

      if (options.proxy) {
        let configStore = new Conf({
          projectName: '@useoptic/openapi-cli',
          schema: {
            'capture-proxy-ca': {
              type: 'object',
              properties: {
                cert: {
                  type: 'string',
                },
                key: {
                  type: 'string',
                },
              },
            },
          },
        });

        let maybeCa = configStore.get('capture-proxy-ca');
        let ca: ProxyCertAuthority;
        if (
          !maybeCa ||
          ProxyCertAuthority.hasExpired(
            maybeCa as ProxyCertAuthority,
            new Date()
          )
        ) {
          ca = await ProxyCertAuthority.generate();
          configStore.set('capture-proxy-ca', ca);
          await feedback.instruction(
            `Generated a CA certificate for HTTPS requests.${
              (!options.ca &&
                ` Run ${command.name()} with --ca <filename> to save it as a file.`) ||
              ''
            }`
          );
        } else {
          ca = maybeCa as ProxyCertAuthority;
        }
        // TODO: consider moving the writing of the cert to its own command (allowing write through stdout and -o)
        if (options.ca) {
          let absoluteCertPath = Path.resolve(options.ca);
          // TODO: validate path before writing to it
          await fs.writeFile(absoluteCertPath, ca.cert);
          await feedback.notable(`CA certificate written to file`);
        }

        let [proxyInteractions, proxyUrl] = await ProxyInteractions.create(
          options.proxy,
          sourcesController.signal,
          { ca }
        );
        sources.push(HarEntries.fromProxyInteractions(proxyInteractions));
        feedback.notable(
          `Proxy created. Redirect traffic you want to capture to ${proxyUrl}`
        );
        interactiveCapture = true;
      }

      if (sources.length < 1) {
        return await feedback.inputError(
          'choose a method of capturing traffic to create a capture',
          InputErrors.CAPTURE_METHOD_MISSING
        );
      }

      let destination: Writable;
      if (filePath) {
        let absoluteFilePath = Path.resolve(filePath);
        let dirPath = Path.dirname(absoluteFilePath);
        let fileBaseName = Path.basename(filePath);

        if (!(await fs.pathExists(dirPath))) {
          return await feedback.inputError(
            `to create ${fileBaseName}, dir must exist at ${dirPath}`,
            InputErrors.DESTINATION_FILE_DIR_MISSING
          );
        }

        destination = fs.createWriteStream(absoluteFilePath);
      } else {
        destination = process.stdout;
      }

      const harEntries = AT.merge(...sources);

      const handleUserSignals = (async function () {
        if (interactiveCapture) {
          // wait for an empty new line on input, which should indicate hitting Enter / Return (or signal of other process)
          let lines = readline.createInterface({ input: process.stdin });
          let onAbort = () => {
            lines.close();
          };
          sourcesController.signal.addEventListener('abort', onAbort);

          for await (let line of lines) {
            if (line.trim().length === 0) {
              if (process.stdin.isTTY) {
                readline.moveCursor(process.stdin, 0, -1);
                readline.clearLine(process.stdin, 1);
              }
              sourcesController.abort();
            }
          }
        }
      })();

      const observations = writeInteractions(harEntries, destination);

      const observationsFork = AT.forkable(observations);
      const renderingStats = renderCaptureProgress(
        feedback,
        observationsFork.fork(),
        interactiveCapture
      );
      const trackingStats = trackStats(
        observationsFork.fork(),
        sourcesController.signal
      );
      observationsFork.start();

      const completing = Promise.all([
        handleUserSignals,
        renderingStats,
        trackingStats,
      ]);

      exitHook((callback) => {
        sourcesController.abort();
        completing.then(
          () => {
            callback();
          },
          (err) => callback(err)
        );
      });

      await completing;
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

  // if (destination.fd == 1) {
  //   // if writing to stdout
  //   // stdout won't close until the process detaches, so we can't use it to measure completion
  harJSON.once('end', onWriteComplete);
  // } else {
  //   destination.once('end', onWriteComplete);
  // }

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

async function renderCaptureProgress(
  feedback: Awaited<ReturnType<typeof createCommandFeedback>>,
  observations: CaptureObservations,
  interactiveCapture: boolean
) {
  const ora = (await import('ora')).default;

  let interactionCount = 0;

  if (interactiveCapture) {
    feedback.instruction('Press [ Enter ] to finish capturing requests');
  }
  let spinner = ora('0 requests captured');
  spinner.start();

  for await (let observation of observations) {
    if (observation.kind === CaptureObservationKind.InteractionCaptured) {
      interactionCount += 1;
      spinner.text = `${interactionCount} requests captured`;
    } else if (observation.kind === CaptureObservationKind.CaptureWritten) {
    }
  }

  if (interactionCount === 0) {
    spinner.info('No requests captured');
  } else {
    spinner.succeed(`${interactionCount} requests written`);
  }
}

async function trackStats(
  observations: CaptureObservations,
  abort: AbortSignal
) {
  const stats = {
    capturedInteractionsCount: 0,
  };

  await trackCompletion(
    'openapi_cli.capture',
    stats,
    async function* () {
      for await (let observation of observations) {
        if (observation.kind === CaptureObservationKind.InteractionCaptured) {
          stats.capturedInteractionsCount += 1;
          yield stats;
        }
      }
    },
    { abort }
  );
}
