import { spawn } from 'child_process';
import { chdir } from 'process';
import path, { dirname } from 'path';
import fsNonPromise from 'fs';
import fs from 'node:fs/promises';
import fetch from 'node-fetch';

import { CaptureConfig, CaptureConfigData, Request } from '../../config';
import { HarEntries, ProxyInteractions } from './captures';
import { writeInteractions } from './capture';
import { RunCommand } from './captures/run-command';
import http, { IncomingMessage, RequestOptions } from 'http';
import { URL } from 'url';
import * as AT from './lib/async-tools';
import { Writable } from 'stream';

async function consume(observations: any) {
  for await (const ob of observations) {
  }
}

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
  const app = spawn(cmd, args);

  // app.stdout.on('data', (data) => {
  //   console.log(data.toString());
  // });

  app.stderr.on('data', (data) => {
    console.log(data.toString());
  });

  // wait until server is ready
  // todo: check the ready_endpoint
  await new Promise((r) => setTimeout(r, capture.server.ready_interval));

  // make requests
  // TODO capturev2 - use fetch here
  console.log(trafficDirectory);
  const allRequests = makeRequests(capture.requests, proxyUrl);

  // write captured requests to disk
  const timestamp = Date.now().toString();
  const sources: HarEntries[] = [];
  sources.push(HarEntries.fromProxyInteractions(proxyInteractions));
  const harEntries = AT.merge(...sources);
  const inProgressName = path.join(trafficDirectory, `${timestamp}.incomplete`);
  let destination: Writable = fsNonPromise.createWriteStream(inProgressName);
  const observations = writeInteractions(harEntries, destination);

  const completedName = path.join(trafficDirectory, `${timestamp}.har`);

  // TODO implement a promise here to wait for requests

  console.log(`NATE: ${allRequests}`);
  await allRequests;
  sourcesController.abort();
  for await (const observation of observations) {
    console.log('waiting forever');
    sourcesController.abort();
  }
  // TODO log finished
  console.log('gaaaaaaah');

  app.kill('SIGTERM');
}

async function makeRequests(
  requests: Request[],
  proxyUrl: string
): Promise<void> {
  const promises = requests.map((request: Request) => {
    let verb = request.verb?.toUpperCase() || 'GET';
    console.log(`${verb} ${proxyUrl}${request.path}`);
    return fetch(`${proxyUrl}${request.path}`);
  });

  try {
    const responses: any = await Promise.all(promises);

    responses.forEach(async (response: Response) => {
      console.log(response.status);
      console.log(await response.json());
    });
  } catch (error) {
    console.error(error);
  }
}
