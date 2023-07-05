import { spawn } from 'child_process';
import { chdir } from 'process';
import path, { dirname } from 'path';
import fsNonPromise from 'fs';
import fs from 'node:fs/promises';
import fetch from 'node-fetch';
import ora from 'ora';
import urljoin from 'url-join';
import { UserError } from '@useoptic/openapi-utilities';
import { CaptureConfigData, Request } from '../../config';
import { HarEntries, ProxyInteractions } from './captures';
import {
  writeInteractions,
  CaptureObservations,
  CaptureObservationKind,
} from './capture';
import * as AT from './lib/async-tools';
import { Writable } from 'stream';
const wait = (time: number) =>
  new Promise((r) => setTimeout(() => r(null), time));

export async function StartCaptureV2Session(
  openApiSpec: string,
  capture: CaptureConfigData,
  proxyPort: number,
  trafficDirectory: string
) {
  if (capture.server.dir === undefined) {
    chdir(dirname(openApiSpec));
  } else {
    chdir(capture.server.dir);
  }

  // start proxy
  let sourcesController = new AbortController();
  let [proxyInteractions, proxyUrl] = await ProxyInteractions.create(
    capture.server.url,
    sourcesController.signal,
    {
      mode: 'reverse-proxy',
      proxyPort: proxyPort,
    }
  );

  // start app
  const cmd = capture.server.command.split(' ')[0];
  const args = capture.server.command.split(' ').slice(1);
  const app = spawn(cmd, args, { detached: true });

  // log error output from the app
  app.stderr.on('data', (data) => {
    console.log(data.toString());
  });

  // wait until server is ready
  await new Promise((r) => setTimeout(r, capture.server.ready_interval));

  if (capture.server.ready_endpoint) {
    const readyEndpoint = capture.server.ready_endpoint;
    const readyInterval = capture.server.ready_interval || 1000;
    const readyUrl = urljoin(capture.server.url, readyEndpoint);

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
  const requests = makeRequests(capture.requests, proxyUrl);

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
  return reqs.map(async (r) => {
    let verb = r.verb || 'GET';
    let opts = { method: verb };

    if (verb === 'POST') {
      opts['headers'] = {
        'content-type': 'application/json;charset=UTF-8',
      };
      opts['body'] = JSON.stringify(r.data || '{}');
    }

    return (
      fetch(`${proxyUrl}${r.path}`, opts)
        .then((response) => response.json())
        // .then((responseData) => {
        //   console.log(responseData);
        // })
        .catch((error) => {
          console.error(error);
        })
    );
  });
}
