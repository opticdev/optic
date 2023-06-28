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
  capture.requests.forEach((r: Request) => {
    const verb = r.verb || 'GET';
    let opts = {
      protocol: proxy.protocol,
      hostname: proxy.hostname,
      port: proxy.port,
      path: r.path,
      method: verb,
    };

    if (verb === 'POST' || verb === 'post') {
      opts['headers'] = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(r.data)),
      };
    }
    const req = http.request(opts, (res) => {
      console.log(`${verb} ${r.path}: ${res.statusCode}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(chunk);
      });
    });

    if (verb === 'POST' || verb === 'post') {
      req.write(JSON.stringify(r.data));
    }

    req.end();
  });

  // stop app

  // stop proxy
}
