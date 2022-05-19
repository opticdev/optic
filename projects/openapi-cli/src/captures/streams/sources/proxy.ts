import * as mockttp from 'mockttp';
import { CompletedRequest, CompletedResponse } from 'mockttp';
import { Subject } from '../../../lib/async-tools';

export interface ProxyInteractions extends AsyncIterable<Proxy.Interaction> {}

export class ProxyInteractions {
  static async create(
    targetHost: string,
    abort: AbortSignal // required, we don't want to ever let a proxy run indefinitely
  ): Promise<[ProxyInteractions, string]> {
    const proxy = mockttp.getLocal({
      cors: false,
      debug: false,
      recordTraffic: false,
    });

    proxy.addRequestRules({
      matchers: [new mockttp.matchers.WildcardMatcher()],
      handler: new mockttp.requestHandlers.PassThroughHandler({
        forwarding: {
          targetHost,
          updateHostHeader: true,
        },
      }),
    });

    proxy.addWebSocketRules({
      matchers: [new mockttp.matchers.WildcardMatcher()],
      handler: new mockttp.webSocketHandlers.PassThroughWebSocketHandler({
        forwarding: {
          targetHost,
        },
      }),
    });

    const interactions = new Subject<Proxy.Interaction>();

    const requestsById = new Map<string, CompletedRequest>();
    await proxy.on('request', (request) => {
      requestsById.set(request.id, request);
    });

    await proxy.on('response', (response) => {
      const { id } = response;
      const request = requestsById.get(id);
      if (!request) return;

      interactions.onNext({
        request,
        response,
      });

      requestsById.delete(id);
    });

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

export declare namespace Proxy {
  interface Interaction {
    request: CompletedRequest;
    response: CompletedResponse;
  }

  interface Request extends CompletedRequest {}
  interface Response extends CompletedResponse {}
}
