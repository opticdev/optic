import * as mockttp from 'mockttp';
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

    const proxy = mockttp.getLocal({
      cors: false,
      debug: false,
      recordTraffic: false,
      https: {
        cert: rootCa.toString('utf-8'),
        key: decryptedPem,
      },
    });

    proxy
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

    proxy.forUnmatchedRequest().thenPassThrough();
    proxy.forAnyWebSocket().thenPassThrough();

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

    await proxy.start();

    const stream = (async function* () {
      yield* interactions.iterator;
      await proxy.stop(); // clean up
    })();

    return [stream, proxy.url];
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
