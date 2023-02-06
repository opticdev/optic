import { Command } from 'commander';
import path from 'path';
import * as fs from 'fs-extra';
import readline from 'readline';
import { Writable } from 'stream';
import exitHook from 'async-exit-hook';
import * as AT from '../lib/async-tools';
import { createCommandFeedback, InputErrors } from './reporters/feedback';
import { trackCompletion } from '../segment';
import logNode from 'log-node';

import { getCertStore } from './setup-tls';
import {
  CapturedInteraction,
  HarEntries,
  HttpArchive,
  ProxyCertAuthority,
  ProxyInteractions,
} from '../captures';
import { SystemProxy } from '../captures/system-proxy';
import { captureStorage } from '../captures/capture-storage';
import { RunCommand } from '../captures/run-command';
import { platform } from '../shell-utils';

export async function captureCommand(): Promise<Command> {
  const command = new Command('capture');

  const feedback = createCommandFeedback(command);

  command
    .argument('<openapi-file>', 'an OpenAPI spec file to add an operation to')
    .argument('<target-url>', 'the url to capture...')

    .description('capture observed traffic as a HAR (HttpArchive v1.3) file')
    // .option(
    //   '--proxy <target-url>',
    //   'accept traffic over a proxy targeting the actual service'
    // )
    .option(
      '--no-tls',
      'disable TLS support for --proxy and prevent generation of new CA certificates'
    )
    .option('--no-system-proxy', 'do not override the system proxy')
    .option(
      '--command <command>',
      'command to run with the http_proxy and http_proxy configured'
    )
    .option(
      '-d, --debug',
      `output debug information (on stderr). Use LOG_LEVEL env with 'debug', 'info' to increase verbosity`
    )
    .option('-o, --output <output>', 'file name for output')
    .action(async (filePath: string, targetUrl: string) => {
      const [openApiExists, trafficDirectory] = await captureStorage(filePath);

      if (!openApiExists) {
        return await feedback.inputError(
          'OpenAPI file not found',
          InputErrors.SPEC_FILE_NOT_FOUND
        );
      }

      const timestamp = Date.now().toString();

      const inProgressName = path.join(
        trafficDirectory,
        `${timestamp}.incomplete`
      );
      const completedName = path.join(trafficDirectory, `${timestamp}.har`);

      const options = command.opts();

      if (options.debug) {
        logNode();
      }

      let sourcesController = new AbortController();
      const sources: HarEntries[] = []; // this should be CapturedInteractions, but those aren't detailed enough yet to not lose information later
      let interactiveCapture = false;

      let ca: ProxyCertAuthority | undefined;

      if (options.tls) {
        const certStore = getCertStore();

        let maybeCa = certStore.get();
        if (
          maybeCa.none ||
          ProxyCertAuthority.hasExpired(maybeCa.val, new Date())
        ) {
          ca = await ProxyCertAuthority.generate();
          certStore.set(ca);
        } else {
          ca = maybeCa.val;
        }
      }

      let [proxyInteractions, proxyUrl] = await ProxyInteractions.create(
        targetUrl,
        sourcesController.signal,
        { ca }
      );

      const runningCommand = Boolean(options.command);

      const systemProxy = new SystemProxy(proxyUrl, feedback);
      if (!runningCommand && options.systemProxy) {
        await systemProxy.start(undefined);
      } else {
        feedback.notable(
          `Optic proxy is running at ${proxyUrl}. Route traffic through it and traffic to ${targetUrl} will be captured`
        );
      }

      sources.push(HarEntries.fromProxyInteractions(proxyInteractions));

      if (!runningCommand) interactiveCapture = true;

      if (sources.length < 1) {
        return await feedback.inputError(
          'choose a method of capturing traffic to create a capture',
          InputErrors.CAPTURE_METHOD_MISSING
        );
      }

      let destination: Writable = fs.createWriteStream(inProgressName);

      const commandRunner = new RunCommand(proxyUrl, feedback);

      let exitCode: number | undefined = undefined;
      if (options.command) {
        const runningCommand = await commandRunner.run(options.command);
        exitCode = runningCommand.exitCode;
        sourcesController.abort();
      }

      const harEntries = AT.merge(...sources);

      const handleUserSignals = (async function () {
        if (interactiveCapture) {
          // wait for an empty new line on input, which should indicate hitting Enter / Return (or signal of other process)
          let lines = readline.createInterface({ input: process.stdin });
          let onAbort = () => {
            lines.close();
          };
          if (runningCommand) await commandRunner.kill();
          sourcesController.signal.addEventListener('abort', onAbort);

          for await (let line of lines) {
            if (line.trim().length === 0) {
              // @todo get this working on windows. It cleans up the incremental request count but fails on windows. It's not essential
              if (process.stdin.isTTY && platform !== 'windows') {
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
        { interactiveCapture, debug: options.debug }
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

        completing
          .then(() =>
            Promise.all([
              !runningCommand ? systemProxy.stop() : Promise.resolve(),
              (async () => {
                if (options.output) {
                  const outputPath = path.resolve(options.output);
                  feedback.success(`Wrote har to ${outputPath}`);
                  return fs.move(inProgressName, outputPath);
                }
                feedback.success(`Wrote har traffic to ${completedName}`);
                return fs.move(inProgressName, completedName);
              })(),
            ])
          )
          .then(
            () => {
              callback();
            },
            (err) => callback(err)
          );
      });

      await completing;
      if (exitCode) process.exit(exitCode);
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
  feedback: ReturnType<typeof createCommandFeedback>,
  observations: CaptureObservations,
  config: { interactiveCapture: boolean; debug: boolean }
) {
  const ora = (await import('ora')).default;

  let interactionCount = 0;

  if (config.interactiveCapture) {
    feedback.instruction('Press [ Enter ] to finish capturing requests');
  }
  let spinner = ora({
    text: '0 requests captured',
    isEnabled: !config.debug,
  });
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
