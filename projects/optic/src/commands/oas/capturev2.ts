import { spawn, ChildProcess } from 'child_process';
import { chdir } from 'process';
import { dirname } from 'path';

import { CaptureConfig, CaptureConfigData, Request } from '../../config';
import { ProxyInteractions } from './captures';
import { RunCommand } from './captures/run-command';
import http, { IncomingMessage } from 'http';
import { URL } from 'url';

export async function StartCaptureV2Session(
  openApiSpec: string,
  capture: CaptureConfigData,
  proxyPort: number
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
  const proxy = new URL(proxyUrl);
  capture.requests.forEach((request: Request) => {
    let opts: RequestOptions = {
      protocol: proxy.protocol,
      hostname: proxy.hostname,
      port: proxy.port,
      path: request.path,
      method: request.verb?.toUpperCase() || 'GET',
    };
    let data = request.data && JSON.stringify(request.data);
    makeRequest(opts, data);
  });


  // stop app
  // stop proxy
}

function makeRequest(opts: any, data: string | undefined) {
  if (data) {
    opts['headers'] = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
  }
  const req = http.request(opts, (res) => {
    console.log(`${opts.method} ${opts.path}: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(chunk);
    });
  });

  if (data) {
    req.write(data);
  }

  req.end();
}
