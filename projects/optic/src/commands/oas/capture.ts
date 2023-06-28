import { Command } from 'commander';
import path from 'path';
import fsNonPromise from 'fs';
import fs from 'node:fs/promises';
import readline from 'readline';
import { Writable } from 'stream';
import exitHook from 'async-exit-hook';
import * as AT from './lib/async-tools';
import { createCommandFeedback, InputErrors } from './reporters/feedback';
import { trackCompletion } from './lib/segment';
import logNode from 'log-node';
import { isJson, isYaml, writeYaml } from '@useoptic/openapi-io';

import { getCertStore } from './setup-tls';
import {
  CapturedInteraction,
  HarEntries,
  HttpArchive,
  ProxyCertAuthority,
  ProxyInteractions,
} from './captures';
import { SystemProxy } from './captures/system-proxy';
import { captureStorage } from './captures/capture-storage';
import { RunCommand } from './captures/run-command';
import { platform } from './lib/shell-utils';
import chalk from 'chalk';
import { runVerify } from './verify';
import { CaptureConfig, OpticCliConfig } from '../../config';
import { StartCaptureV2Session } from './capturev2';
import { clearCommand } from './capture-clear';
import { createNewSpecFile } from '../../utils/specs';
import { logger } from '../../logger';

export async function captureCommand(config: OpticCliConfig): Promise<Command> {
  const command = new Command('capture');
  const feedback = createCommandFeedback(command);

  command.addCommand(clearCommand());

  command
    .argument('<openapi-file>', 'an OpenAPI spec file to add an operation to')
    .argument('[target-url]', 'the url to capture...')

    .description('capture observed traffic as a HAR (HttpArchive v1.3) file')
    .option(
      '--no-tls',
      'disable TLS support for --proxy and prevent generation of new CA certificates'
    )
    .option(
      '-r, --reverse-proxy',
      'run optic capture in reverse proxy mode - send traffic to a port that gets forwarded to your server'
    )
    .option(
      '--proxy-port <proxy-port>',
      'specify the port the proxy should be running on'
    )
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
      const { openApiExists, trafficDirectory } = await captureStorage(
        filePath
      );

      if (!openApiExists) {
        const specFile = createNewSpecFile('3.1.0');
        if (isJson(filePath)) {
          logger.info(`Initializing OpenAPI file at ${filePath}`);
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, JSON.stringify(specFile, null, 2));
        } else if (isYaml(filePath)) {
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          logger.info(`Initializing OpenAPI file at ${filePath}`);
          await fs.writeFile(filePath, writeYaml(specFile));
        } else {
          return await feedback.inputError(
            'OpenAPI file not found',
            InputErrors.SPEC_FILE_NOT_FOUND
          );
        }
      }

      const timestamp = Date.now().toString();

      const inProgressName = path.join(
        trafficDirectory,
        `${timestamp}.incomplete`
      );
      const completedName = path.join(trafficDirectory, `${timestamp}.har`);

      const options = command.opts();

      if (options.proxyPort && isNaN(Number(options.proxyPort))) {
        logger.error(
          `--proxy-port must be a number - received ${options.proxyPort}`
        );
        process.exitCode = 1;
        return;
      }

      if (options.debug) {
        logNode();
      }

      let sourcesController = new AbortController();
      const sources: HarEntries[] = []; // this should be CapturedInteractions, but those aren't detailed enough yet to not lose information later

      let interactiveCapture = false;

      let ca: ProxyCertAuthority | undefined;

      //
      // capture 2.0
      //
      if (targetUrl === undefined && config.capture !== undefined) {
        StartCaptureV2Session(
          Object.keys(config.capture[filePath])[0],
          config.capture[filePath],
          options.ProxyPort
        );
        process.exitCode = 0;
        return;
      }

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
        {
          ca,
          mode: options.reverseProxy ? 'reverse-proxy' : 'system-proxy',
          proxyPort: options.proxyPort && Number(options.proxyPort),
        }
      );

      const runningCommand = Boolean(options.command);

      const systemProxy = new SystemProxy(proxyUrl, feedback);
      if (!runningCommand && !options.reverseProxy) {
        await systemProxy.start(undefined);
      } else {
        logger.info(
          `${chalk.blue.bold('Proxy URL:')} ${proxyUrl} (send traffic here)`
        );
        logger.info(
          `${chalk.blue.bold(
            'Forwarding URL:'
          )} ${targetUrl} (traffic will be forwarded here)`
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

      let destination: Writable =
        fsNonPromise.createWriteStream(inProgressName);

      const commandRunner = new RunCommand(proxyUrl, feedback, {
        reverseProxy: options.reverseProxy,
      });

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
        {
          interactiveCapture,
          debug: options.debug,
          reverseProxy: options.reverseProxy,
        }
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
          .then(async () =>
            Promise.all([
              !runningCommand ? await systemProxy.stop() : Promise.resolve(),
              (async () => {
                if (options.output) {
                  const outputPath = path.resolve(options.output);
                  feedback.success(`Wrote har to ${outputPath}`);
                  return await fs.rename(inProgressName, outputPath);
                }
                await fs.rename(inProgressName, completedName);

                try {
                  await runVerify(
                    filePath,
                    {
                      exit0: true,
                      har: options.output
                        ? path.resolve(options.output)
                        : undefined,
                    },
                    config,
                    feedback,
                    {
                      printCoverage: false,
                    }
                  );
                } catch (e) {
                  console.log(e);
                }

                if (!interactiveCapture) {
                  // Log next steps
                  feedback.success(`Wrote har traffic to ${completedName}`);
                  feedback.log(
                    `\nRun "${chalk.bold(
                      `optic verify ${filePath}`
                    )}" to diff the captured traffic`
                  );
                }
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
  config: { interactiveCapture: boolean; debug: boolean; reverseProxy: boolean }
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

  let timer;
  if (config.interactiveCapture && !config.reverseProxy) {
    timer = setTimeout(() => {
      if (interactionCount === 0) {
        spinner.clear();
        console.log(
          '\nNot seeing any traffic captured? Make sure your HTTP Client is using the proxy: ' +
            chalk.underline.blue(
              'https://www.useoptic.com/docs/oas-reference/client-guides'
            )
        );
        spinner.start();
      }
    }, 13000);
  }

  for await (let observation of observations) {
    if (observation.kind === CaptureObservationKind.InteractionCaptured) {
      if (interactionCount === 0) clearTimeout(timer);
      interactionCount += 1;
      spinner.text = `${interactionCount} requests captured`;
    } else if (observation.kind === CaptureObservationKind.CaptureWritten) {
    }
  }

  clearTimeout(timer);

  if (interactionCount === 0) {
    spinner.info('No requests captured');
  } else {
    spinner.succeed(`${interactionCount} requests captured`);
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
