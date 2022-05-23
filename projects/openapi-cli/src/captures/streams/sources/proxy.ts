import * as mockttp from 'mockttp';
import { CompletedRequest, CompletedResponse, CompletedBody } from 'mockttp';
import { Subject } from '../../../lib/async-tools';

export interface ProxyInteractions
  extends AsyncIterable<ProxySource.Interaction> {}

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

    const interactions = new Subject<ProxySource.Interaction>();

    const requestsById = new Map<string, ProxySource.Request>();
    // TODO: figure out if we can use OngoingRequest instead of captured, at which body
    // hasn't been parsed yet and is available as stream
    await proxy.on('request', (capturedRequest) => {
      const {
        matchedRuleId,
        remoteIpAddress,
        remotePort,
        tags,
        body,
        ...rest
      } = capturedRequest;

      const request = {
        ...rest,
        body: { buffer: body.buffer },
      };

      requestsById.set(request.id, request);
    });

    // TODO: figure out if we can use OngoingRequest instead of captured, at which body
    // hasn't been parsed yet and is available as stream
    await proxy.on('response', (capturedResponse) => {
      const { id } = capturedResponse;
      const request = requestsById.get(id);
      if (!request) return;

      const { tags, body, ...rest } = capturedResponse;

      const response = {
        ...rest,
        body: { buffer: body.buffer },
      };
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
    body: Body;
  }
  interface Response extends Omit<CompletedResponse, 'tags' | 'body'> {
    body: Body;
  }

  type Body = Pick<CompletedBody, 'buffer'>;
}
