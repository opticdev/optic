import * as mockttp from 'mockttp';
import { CompletedRequest, CompletedResponse, TimingEvents } from 'mockttp';
import { URL } from 'url';
import portfinder from 'portfinder';
import chalk from 'chalk';
import { UserError } from '@useoptic/openapi-utilities';
import urljoin from 'url-join';
import { Subject } from 'axax/esnext';

import { logger } from '../../../logger';

export interface ProxyInteractions
  extends AsyncIterable<ProxySource.Interaction> {}

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
  interface Response extends Omit<CompletedResponse, 'tags' | 'body'> {
    timingEvents: TimingEvents;
    body: Body;
  }

  type Body = Pick<mockttp.CompletedBody, 'buffer'>;
}

export class ProxyServer {
  private interactionSubject?: Subject<ProxySource.Interaction>;
  private url: URL;
  private capturingProxy?: mockttp.Mockttp = undefined;

  constructor(target: string) {
    try {
      this.url = new URL(target);
    } catch (e) {
      logger.error(
        `${chalk.red(
          'Error:'
        )} Invalid URL. Valid URLs must include the protocol and host, e.g. http://localhost:3030 or https://api.example.com, received: ${target}`
      );
      throw new UserError();
    }
  }

  public async start(
    port: number | undefined
  ): Promise<[ProxyInteractions, string]> {
    const { origin, pathname: serverPathnamePrefix } = this.url;

    const capturingProxy = mockttp.getLocal({
      cors: false,
      debug: false,
      recordTraffic: false,
    });
    const interactionSubject = new Subject<ProxySource.Interaction>();
    this.interactionSubject = interactionSubject;
    this.capturingProxy = capturingProxy;
    const requestsById = new Map<string, ProxySource.Request>();
    if (!port) {
      port = await portfinder.getPortPromise({
        port: 8000,
        stopPort: 8999,
      });
    }

    await capturingProxy
      .forAnyRequest()
      .always()
      .thenPassThrough({
        beforeRequest: (capturedRequest: CompletedRequest) => {
          const {
            matchedRuleId,
            remoteIpAddress,
            remotePort,
            tags,
            body,
            timingEvents,
            ...rest
          } = capturedRequest;
          // Sometimes we need to adjust the request url if the server url is not at the hostname root
          // e.g. `http://example.com/server-lives-here - requests going to the proxy root should be forwarded to `/server-lives-here`
          const urlObj = new URL(rest.url);
          urlObj.pathname = urljoin(serverPathnamePrefix, urlObj.pathname);
          const prefixedUrl = urlObj.toString();
          logger.debug(
            `Forwarding request ${
              rest.path
            } ${prefixedUrl} with headers: ${JSON.stringify(
              rest.headers
            )}. id: ${capturedRequest.id}`
          );

          const request = {
            ...rest,
            body: { buffer: body.buffer },
            timingEvents: timingEvents as TimingEvents,
          };
          requestsById.set(request.id, request);
          return {
            url: prefixedUrl,
          };
        },
        forwarding: {
          targetHost: origin,
          updateHostHeader: true,
        },
      });

    await capturingProxy.on(
      'response',
      (capturedResponse: CompletedResponse) => {
        const { id } = capturedResponse;
        const request = requestsById.get(id);
        if (!request) return;

        const { tags, body, timingEvents, ...rest } = capturedResponse;
        logger.debug(
          `Received response for request id ${id} status code: ${
            rest.statusCode
          } message: ${rest.statusMessage} headers: ${JSON.stringify(
            rest.rawHeaders
          )}`
        );

        const response = {
          ...rest,
          body: { buffer: body.buffer },
          timingEvents: timingEvents as TimingEvents,
        };
        interactionSubject.onNext({
          request,
          response,
        });

        requestsById.delete(id);
      }
    );

    await capturingProxy.start({
      startPort: port,
      endPort: port + 999,
    });

    const stream = (async function* () {
      yield* interactionSubject.iterator;
    })();

    return [stream, capturingProxy.url];
  }

  stop() {
    this.capturingProxy?.reset();
    this.capturingProxy?.stop();
    this.interactionSubject?.onCompleted();
  }
}
