import { Command, Option } from 'commander';
import { spawn } from 'child_process';
import { chdir } from 'process';
import path from 'path';
import fs from 'node:fs/promises';
import fsNonPromise from 'fs';
import fetch from 'node-fetch';
import Bottleneck from 'bottleneck';

import { isJson, isYaml, writeYaml } from '@useoptic/openapi-io';
import ora from 'ora';
import urljoin from 'url-join';
import { UserError } from '@useoptic/openapi-utilities';
import { Request } from '../../config';
import { HarEntries, ProxyInteractions } from '../oas/captures';
import {
  writeInteractions,
  CaptureObservations,
  CaptureObservationKind,
} from '../oas/capture';
import * as AT from '../oas/lib/async-tools';
import { Writable } from 'stream';
import { errorHandler } from '../../error-handler';

import { createNewSpecFile } from '../../utils/specs';
import { logger } from '../../logger';
import { OpticCliConfig } from '../../config';
import { clearCommand } from '../oas/capture-clear';
import { captureStorage } from '../oas/captures/capture-storage';
import { captureV1 } from '../oas/capture';

const wait = (time: number) =>
  new Promise((r) => setTimeout(() => r(null), time));

export function registerCaptureCommand(cli: Command, config: OpticCliConfig) {
  const command = new Command('capture');

  command.addCommand(clearCommand());

  command
    .argument('<openapi-file>', 'an OpenAPI spec file to add an operation to')
    .argument(
      '[target-url]',
      'the url to capture (deprecated, use optic.yml configuration instead)'
    )
    .description('capture traffic using the configuration in optic.yml')
    .option(
      '--proxy-port <proxy-port>',
      'specify the port the proxy should be running on'
    )

    // TODO deprecate hidden options below
    .addOption(
      new Option(
        '--no-tls',
        'disable TLS support for --proxy and prevent generation of new CA certificates'
      ).hideHelp()
    )
    .addOption(
      new Option(
        '-r, --reverse-proxy',
        'run optic capture in reverse proxy mode - send traffic to a port that gets forwarded to your server'
      ).hideHelp()
    )
    .addOption(
      new Option(
        '--command <command>',
        'command to run with the http_proxy and http_proxy configured'
      ).hideHelp()
    )
    .addOption(
      new Option(
        '-d, --debug',
        `output debug information (on stderr). Use LOG_LEVEL env with 'debug', 'info' to increase verbosity`
      ).hideHelp()
    )
    .addOption(
      new Option('-o, --output <output>', 'file name for output').hideHelp()
    )
    .action(
      errorHandler(getCaptureAction(config, command), { command: 'capture' })
    );

  cli.addCommand(command);
}
type CaptureActionOptions = {
  proxyPort?: string;
};

const getCaptureAction =
  (config: OpticCliConfig, command: Command) =>
  async (
    filePath: string,
    targetUrl: string | undefined,
    options: CaptureActionOptions
  ) => {
    // TODO capturev2 - handle relative path from root (tbd - what do we do when we handle this outside of a git repo)
    const captureConfig = config.capture?.[filePath];

    if (targetUrl !== undefined) {
      await captureV1(filePath, targetUrl, config, command);
      return;
    } else if (targetUrl !== undefined || captureConfig === undefined) {
      // TODO log error and run capture init or something - tbd what the first use is
      process.exitCode = 1;
      return;
    } else if (options.proxyPort && isNaN(Number(options.proxyPort))) {
      logger.error(
        `--proxy-port must be a number - received ${options.proxyPort}`
      );
      process.exitCode = 1;
      return;
    }

    const { openApiExists, trafficDirectory } = await captureStorage(filePath);

    if (!openApiExists) {
      const fileCreated = await createOpenAPIFile(filePath);
      if (!fileCreated) {
        process.exitCode = 1;
        logger.error('Could not find OpenAPI file');
        return;
      }
    }
    if (captureConfig.server.dir === undefined) {
      chdir(path.dirname(filePath));
    } else {
      chdir(captureConfig.server.dir);
    }
    let sourcesController = new AbortController();
    let [proxyInteractions, proxyUrl] = await ProxyInteractions.create(
      captureConfig.server.url,
      sourcesController.signal,
      {
        mode: 'reverse-proxy',
        proxyPort: options.proxyPort ? Number(options.proxyPort) : undefined,
      }
    );

    // start app
    const cmd = captureConfig.server.command.split(' ')[0];
    const args = captureConfig.server.command.split(' ').slice(1);
    const app = spawn(cmd, args, { detached: true });

    // log error output from the app
    app.stderr.on('data', (data) => {
      console.log(data.toString());
    });

    // wait until server is ready
    await new Promise((r) =>
      setTimeout(r, captureConfig.server.ready_interval)
    );

    if (captureConfig.server.ready_endpoint) {
      const readyEndpoint = captureConfig.server.ready_endpoint;
      const readyInterval = captureConfig.server.ready_interval || 1000;
      const readyUrl = urljoin(captureConfig.server.url, readyEndpoint);

      const timeout = 10 * 60 * 1_000; // 10 minutes
      const now = Date.now();
      const spinner = ora('Waiting for server to come online...');
      spinner.start();
      spinner.color = 'blue';

      const checkServer = (): Promise<boolean> =>
        fetch(readyUrl)
          .then((res) => String(res.status).startsWith('2'))
          .catch(() => false);

      let done = false;
      while (!done) {
        const isReady = await checkServer();
        if (isReady) {
          spinner.succeed('Server check passed');
          done = true;
        } else if (Date.now() > now + timeout) {
          throw new UserError('Server check timed out (waited for 10 minutes)');
        }
        await wait(readyInterval);
      }
    }

    // make requests
    console.log(trafficDirectory);
    const requests = makeRequests(captureConfig.requests, proxyUrl);

    // write captured requests to disk
    const timestamp = Date.now().toString();
    const tmpName = path.join(trafficDirectory, `${timestamp}.incomplete`);
    const observations = writeHar(proxyInteractions, tmpName);

    Promise.all(requests)
      .then(() => {
        process.kill(-app.pid!);
        sourcesController.abort();
        const completedName = path.join(trafficDirectory, `${timestamp}.har`);
        fs.rename(tmpName, completedName);
      })
      .catch((error) => {
        console.error(error);
      });

    for await (const observation of observations) {
      if (observation.kind === CaptureObservationKind.InteractionCaptured) {
        console.log(`Captured ${observation.path}`);
      }
    }

    console.log(
      'Requests captured. Run `optic update --all` to document updates.'
    );
  };

async function createOpenAPIFile(filePath: string): Promise<boolean> {
  const specFile = createNewSpecFile('3.1.0');
  if (isJson(filePath)) {
    logger.info(`Initializing OpenAPI file at ${filePath}`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(specFile, null, 2));
    return true;
  } else if (isYaml(filePath)) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    logger.info(`Initializing OpenAPI file at ${filePath}`);
    await fs.writeFile(filePath, writeYaml(specFile));
    return true;
  } else {
    return false;
  }
}

function writeHar(
  proxyInteractions: ProxyInteractions,
  harFile: string
): CaptureObservations {
  const sources: HarEntries[] = [];
  sources.push(HarEntries.fromProxyInteractions(proxyInteractions));
  const harEntries = AT.merge(...sources);
  let destination: Writable = fsNonPromise.createWriteStream(harFile);
  return writeInteractions(harEntries, destination);
}

function makeRequests(reqs: Request[], proxyUrl: string): Promise<void>[] {
  const limiter = new Bottleneck({
    maxConcurrent: 4,
    minTime: 0,
  });

  return reqs.map(async (r) => {
    let verb = r.verb || 'GET';
    let opts = { method: verb };

    if (verb === 'POST') {
      opts['headers'] = {
        'content-type': 'application/json;charset=UTF-8',
      };
      opts['body'] = JSON.stringify(r.data || '{}');
    }

    return limiter.schedule(() =>
      fetch(`${proxyUrl}${r.path}`, opts)
        .then((response) => response.json())
        .catch((error) => {
          console.error(error);
        })
    );
  });
}
