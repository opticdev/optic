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

  // log error output from the app
  app.stderr.on('data', (data) => {
    console.log(data.toString());
  });

  // wait until server is ready
  // todo: check the ready_endpoint
  await new Promise((r) => setTimeout(r, capture.server.ready_interval));

  // make requests
  console.log(trafficDirectory);
  const requests = capture.requests.map(async (r) => {
    let verb = r.verb || 'GET';
    let opts = { method: verb };

    if (verb === 'POST') {
      opts['headers'] = {
        'content-type': 'application/json;charset=UTF-8',
      };
      opts['body'] = JSON.stringify(r.data || '{}');
    }

    return fetch(`${proxyUrl}${r.path}`, opts)
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData);
      })
      .catch((error) => {
        console.error(error);
      });
  });

  // write captured requests to disk
  const timestamp = Date.now().toString();
  const sources: HarEntries[] = [];
  sources.push(HarEntries.fromProxyInteractions(proxyInteractions));
  const harEntries = AT.merge(...sources);
  const inProgressName = path.join(trafficDirectory, `${timestamp}.incomplete`);
  let destination: Writable = fsNonPromise.createWriteStream(inProgressName);
  const observations = writeInteractions(harEntries, destination);

  Promise.all(requests)
    .then(() => {
      sourcesController.abort();
      const completedName = path.join(trafficDirectory, `${timestamp}.har`);
      fs.rename(inProgressName, completedName);
    })
    .catch((error) => {
      console.error(error);
    });

  for await (const observation of observations) {
  }

  // TODO log finished
  console.log(
    'Requests captured. Run `optic update --all` to document updates.'
  );
}
