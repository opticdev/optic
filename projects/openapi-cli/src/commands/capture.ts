import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';
import readline from 'readline';
import { AbortController } from 'node-abort-controller';
import * as AT from '../lib/async-tools';

import {
  CapturedInteraction,
  CapturedInteractions,
  HarEntries,
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
      const sources: HarEntries[] = [];
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

      const harEntries = AT.merge(...sources);

      const destination = process.stdout;

      let harJSON = HarEntries.toHarJSON(harEntries);

      harJSON.pipe(process.stdout);

      await Promise.all([handleUserSignals]);
    });

  return command;
}
