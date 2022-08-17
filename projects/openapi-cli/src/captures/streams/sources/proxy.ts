import * as mockttp from 'mockttp';
import Net from 'net';
import {
  CompletedRequest,
  CompletedResponse,
  CompletedBody,
  TimingEvents,
} from 'mockttp';
import { Subject } from '../../../lib/async-tools';
import { AbortSignal } from 'node-abort-controller'; // remove when Node v14 is out of LTS
import Path from 'path';
import forge from 'node-forge';
import fs from 'fs/promises';
import { createServer } from '@httptoolkit/httpolyglot';
import { URL } from 'url';

export interface ProxyInteractions
  extends AsyncIterable<ProxySource.Interaction> {}

export class ProxyInteractions {
  static async create(
    targetHost: string,
    abort: AbortSignal // required, we don't want to ever let a proxy run indefinitely
  ): Promise<[ProxyInteractions, string]> {
    const interactions = new Subject<ProxySource.Interaction>();

    const [rootCa, privateKey] = await Promise.all([
      fs.readFile(Path.join(__dirname, '../../../../root-ca.pem')),
      fs.readFile(Path.join(__dirname, '../../../../key.pem')),
    ]);
    const decryptedPrivateKey = forge.pki.decryptRsaPrivateKey(
      privateKey,
      'test'
    );
    const decryptedPem = forge.pki.privateKeyToPem(decryptedPrivateKey);

    const capturingProxy = mockttp.getLocal({
      cors: false,
      debug: true,
      recordTraffic: false,
      // https: {
      //   cert: rootCa.toString('utf-8'),
      //   key: decryptedPem,
      // },
    });

    const proxy = createServer((req, res) => {
      // @ts-ignore
      const capturingProxyServer = capturingProxy.server as Net.Server;
      capturingProxyServer.emit('request', req, res);
    }).listen(8000);

    proxy.on('connect', (connectReq, clientSocket, head) => {
      const { hostname, port, host } = new URL(`http://${connectReq.url}`);

      console.log('CONNECT!', host);

      if (host === targetHost || hostname === targetHost) {
        console.log('TARGET!');
        // @ts-ignore
        const capturingProxyServer = capturingProxy.server as Net.Server;
        capturingProxyServer.emit('connection', clientSocket);
      } else {
        const originSocket = Net.connect(
          (port && parseInt(port)) || 80,
          hostname,
          () => {
            clientSocket.write(
              'HTTP/1.1 200 OK\r\nProxy-agent: OAS-capture-proxy\r\n\r\n'
            );

            originSocket.write(head);
            originSocket.pipe(clientSocket);
            clientSocket.pipe(originSocket);
          }
        );
      }
    });

    capturingProxy
      .forAnyRequest()
      .forHost(targetHost)
      .always()
      .thenPassThrough({
        beforeRequest: onRequest,
        beforeResponse: onResponse,
        forwarding: {
          targetHost,
          updateHostHeader: true,
        },
      });

    capturingProxy.forUnmatchedRequest().thenPassThrough();
    capturingProxy.forAnyWebSocket().thenPassThrough();

    const requestsById = new Map<string, ProxySource.Request>();
    // TODO: figure out if we can use OngoingRequest instead of captured, at which body
    // hasn't been parsed yet and is available as stream
    function onRequest(capturedRequest: CompletedRequest) {
      const {
        matchedRuleId,
        remoteIpAddress,
        remotePort,
        tags,
        body,
        timingEvents,
        ...rest
      } = capturedRequest;

      const request = {
        ...rest,
        body: { buffer: body.buffer },
        timingEvents: timingEvents as TimingEvents,
      };

      requestsById.set(request.id, request);
    }

    // TODO: figure out if we can use OngoingRequest instead of captured, at which body
    // hasn't been parsed yet and is available as stream
    function onResponse(
      capturedResponse: mockttp.requestHandlers.PassThroughResponse
    ) {
      const { id } = capturedResponse;
      const request = requestsById.get(id);
      if (!request) return;

      const { body, ...rest } = capturedResponse;

      const response = {
        ...rest,
        body: { buffer: body.buffer },
        // timingEvents: timingEvents as TimingEvents,
      };
      interactions.onNext({
        request,
        response,
      });

      requestsById.delete(id);
    }

    abort.addEventListener('abort', onAbort);

    interactions.finally(() => {
      abort.removeEventListener('abort', onAbort);
    });

    function onAbort(e) {
      interactions.onCompleted();
    }

    await capturingProxy.start();

    const stream = (async function* () {
      yield* interactions.iterator;
      await capturingProxy.stop(); // clean up
    })();

    return [stream, capturingProxy.url];
  }
}

export declare namespace ProxySource {
  interface Interaction {
    request: Request;
    response: Response;
  }

  interface Request
    extends Omit<
      CompletedRequest,
      'matchedRuleId' | 'remoteIpAddress' | 'remotePort' | 'tags' | 'body'
    > {
    timingEvents: TimingEvents;
    body: Body;
  }
  interface Response
    extends Omit<mockttp.requestHandlers.PassThroughResponse, 'body'> {
    body: Body;
  }

  type Body = Pick<CompletedBody, 'buffer'>;
}
