import os from 'os';
import { AddressInfo } from 'net';
import http from 'http';
import fetch from 'node-fetch';

import express from "express";

import { SnifferSource } from '../sniffer';
import { ApiTraffic } from '../../types';
import { waitFor } from '../../../../utils/debug_waitFor';

const rootOnlyIt = os.userInfo().uid == 0 ? it : it.skip;

describe('capture sources', () => {
  rootOnlyIt('can parse captured traffic', async () => {
    let server = startServer();
    let addr: AddressInfo | string = server.address() as AddressInfo;
    console.log(`server addr ${JSON.stringify(server.address())}`);

    const source = new SnifferSource({interface: 'lo0', port: addr.port});


    const examples: ApiTraffic[] = [];
    source.on('traffic', (example) => {
      //console.log(example);
      examples.push(example);
    });

    await source.start();

    for (var i = 0; i < 4; i++) {
      let url = makeTestURL(server, i)
      await fetch(url);
    }

    await waitFor(300);
    await source.stop();
    server.close();

    expect(JSON.stringify(examples)).toMatchSnapshot();
  });
});

function startServer(): http.Server {
  const app = express();
  const port = 0;
  
  app.get('/get', (req: any, res: any) => {
    res.send(JSON.stringify(req.query));
  });
  
  return app.listen(port);
}

function makeTestURL(server: http.Server, id: number): string {
    let addr: AddressInfo | string = server.address() as AddressInfo;
    if (addr.family == "IPv6") {
      return `http://[${addr.address}]:${addr.port}/get?i=${id}`;
    } else {
      return `http://${addr.address}:${addr.port}/get?i=${id}`;
    }
}
