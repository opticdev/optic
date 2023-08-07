import * as mockttp from 'mockttp';
import events from 'events';
import {
  CompletedRequest,
  CompletedResponse,
  CompletedBody,
  TimingEvents,
} from 'mockttp';

import { Subject } from '../../oas/lib/async-tools';
import { pki, md } from 'node-forge';
import { randomBytes } from 'crypto';
import { Readable } from 'stream';
import EventEmitter from 'events';
import http from 'http';
import http2 from 'http2';
import tls from 'tls';
import net from 'net';
import { URL } from 'url';
import * as httpolyglot from '@httptoolkit/httpolyglot';
import { Server as ConnectServer } from 'connect';
import portfinder from 'portfinder';
import globalLog from 'log';
import chalk from 'chalk';
import { UserError } from '@useoptic/openapi-utilities';
import { logger } from '../../../logger';
import urljoin from 'url-join';

type Logger = typeof globalLog;

export const log: Logger = globalLog.get('captures:streams:sources:proxy'); // export so it can be enabled in testing

export interface ProxyInteractions
  extends AsyncIterable<ProxySource.Interaction> {}

export class ProxyInteractions {
  static async create(
    targetHost: string,
    abort: AbortSignal, // required, we don't want to ever let a proxy run indefinitely
    options: {
      ca?: ProxyCertAuthority;
      targetCA?: Array<{ cert: Buffer | string }>;
      mode: 'reverse-proxy' | 'system-proxy';
      proxyPort?: number;
    }
  ): Promise<[ProxyInteractions, string, string]> {
    let host: string;
    let protocol: string;
    let origin: string;
    let serverPathnamePrefix: string;
    try {
      ({
        host,
        protocol,
        origin,
        pathname: serverPathnamePrefix,
      } = new URL(targetHost));
    } catch (e) {
      logger.error(
        `${chalk.red(
          'Error:'
        )} Invalid URL. Valid URLs must include the protocol and host, e.g. http://localhost:3030 or https://api.example.com, received: ${targetHost}`
      );
      throw new UserError();
    }
    targetHost = host;

    const forwardHost = options.mode === 'reverse-proxy' ? origin : targetHost;

    const capturingProxy = mockttp.getLocal({
      cors: false,
      debug: false,
      recordTraffic: false,
      https: options.ca && {
        cert: options.ca.cert.toString(),
        key: options.ca.key.toString(),
      },
    });

    let forwardedHosts = [forwardHost];
    await capturingProxy
      .forAnyRequest()
      .always()
      .matching((request: CompletedRequest) => {
        // our own matching, adapted from mockttp's HostMatcher, so we can forward
        // direct requests to the proxy to the target as well
        const parsedUrl = new URL(request.url);

        let result = false;
        for (let host of forwardedHosts) {
          if (
            (host.endsWith(':80') && request.protocol === 'http') ||
            (host.endsWith(':443') && request.protocol === 'https')
          ) {
            // On default ports, our URL normalization erases an explicit port, so that a
            // :80 here will never match anything. This handles that case: if you send HTTP
            // traffic on port 80 then the port is blank, but it should match for 'hostname:80'.
            result =
              result ||
              (parsedUrl.hostname === host.split(':')[0] &&
                parsedUrl.port === '');
          } else {
            result = result || parsedUrl.host === host;
          }
          if (result) break;
        }

        return result;
      })
      .thenPassThrough({
        beforeRequest: onTargetedRequest,
        forwarding: {
          targetHost: forwardHost,
          updateHostHeader: true,
        },
        trustAdditionalCAs: options.targetCA || [],
      });

    await capturingProxy.forUnmatchedRequest().thenPassThrough({
      beforeRequest(capturedRequest) {
        log.info('proxying request to ' + capturedRequest.url);
      },
    });
    await capturingProxy.forAnyWebSocket().thenPassThrough();

    const interactions = new Subject<ProxySource.Interaction>();

    const requestsById = new Map<string, ProxySource.Request>();
    function onTargetedRequest(capturedRequest: CompletedRequest) {
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
        } ${prefixedUrl} with headers: ${JSON.stringify(rest.headers)}. id: ${
          capturedRequest.id
        }`
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
    }

    function onResponse(capturedResponse: CompletedResponse) {
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
      interactions.onNext({
        request,
        response,
      });

      requestsById.delete(id);
    }

    let alreadyLoggedTlsError = false;
    function onTLSError(error) {
      if (
        !alreadyLoggedTlsError &&
        protocol === 'https:' &&
        error.failureCause === 'cert-rejected' &&
        targetHost === error.hostname
      ) {
        alreadyLoggedTlsError = true;
        console.error(
          chalk.red(
            '\nYou are trying to intercept a https host without a trusted certificate for the Optic Proxy.\nYou need to run "optic setup-tls" to generate and trust a certificate'
          )
        );
      }
    }

    await Promise.all([
      capturingProxy.on('response', onResponse),
      capturingProxy.on('tls-client-error', onTLSError),
    ]);

    abort.addEventListener('abort', onAbort);

    interactions.finally(() => {
      abort.removeEventListener('abort', onAbort);
    });

    function onAbort(e) {
      capturingProxy.reset();
      capturingProxy.stop();
      transparentProxy.stop();
      interactions.onCompleted();
    }

    let transparentPort = options.proxyPort
      ? options.proxyPort
      : await portfinder.getPortPromise({
          port: 8000,
          stopPort: 8999,
        });
    await capturingProxy.start({
      startPort: transparentPort + 1,
      endPort: transparentPort + 999,
    });
    forwardedHosts.push(`localhost:${capturingProxy.port}`);
    log.info('capturing proxy started at %s', capturingProxy.url);

    // sits in front of the capturing proxy to only direct target host traffic
    // and transparently forward the rest
    // @ts-ignore
    let capturingApp = capturingProxy.app as ConnectServer;
    // @ts-ignore
    let capturingServer = capturingProxy.server as net.Server;
    // @ts-ignore
    const tlsServer = capturingServer._tlsServer as tls.Server &
      tls.SecureContextOptions;

    const transparentProxy = new TransparentProxy(
      targetHost,
      capturingApp,
      capturingServer,
      {
        https: options.ca && {
          ca: [options.ca.cert],
          cert: tlsServer.cert,
          key: tlsServer.key,
        },
      }
    );

    await transparentProxy.start(transparentPort);
    forwardedHosts.push(`localhost:${transparentProxy.port}`);
    log.info('transparent proxy started at %s', transparentProxy.url);

    const stream = (async function* () {
      yield* interactions.iterator;
    })();

    return [stream, transparentProxy.url!, capturingProxy.url];
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
  interface Response extends Omit<CompletedResponse, 'tags' | 'body'> {
    timingEvents: TimingEvents;
    body: Body;
  }

  type Body = Pick<CompletedBody, 'buffer'>;
}

export interface ProxyCertAuthority {
  cert: string;
  key: string;
  keyLength?: number;
}

export class ProxyCertAuthority {
  static async generate(): Promise<ProxyCertAuthority> {
    const keyPair = await new Promise<pki.rsa.KeyPair>((resolve, reject) => {
      pki.rsa.generateKeyPair({ bits: 2048 }, (err, keypair) => {
        if (err) {
          reject(err);
        } else {
          resolve(keypair);
        }
      });
    });

    const cert = pki.createCertificate();
    cert.publicKey = keyPair.publicKey;
    cert.serialNumber = generateSerialNumber();
    const curYear = new Date().getFullYear();

    cert.validity.notBefore = new Date();
    cert.validity.notBefore.setDate(cert.validity.notBefore.getDate() - 1); // account for wonky time keeping
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(curYear + 2);

    cert.setSubject([
      {
        name: 'commonName',
        value: `Optic CLI CA (locally generated ${new Date().toISOString()})`,
      },
      { name: 'countryName', value: 'US' },
      { name: 'stateOrProvinceName', value: 'NY' },
      { name: 'localityName', value: 'New York City' },
      { name: 'organizationName', value: 'Optic Labs Corporation' },
      { name: 'organizationalUnitName', value: 'https://useoptic.com' },
    ]);
    cert.setIssuer(cert.subject.attributes); // self-signed

    cert.setExtensions([
      { name: 'basicConstraints', cA: true, critical: true },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        cRLSign: true,
        critical: true,
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
      },
      {
        name: 'subjectKeyIdentifier',
      },
    ]);

    cert.sign(keyPair.privateKey, md.sha256.create());

    return {
      cert: pki.certificateToPem(cert),
      key: pki.privateKeyToPem(keyPair.privateKey),
    };
  }

  static hasExpired(self: ProxyCertAuthority, dateTime: Date): boolean {
    const cert = pki.certificateFromPem(self.cert);

    return (
      dateTime < cert.validity.notBefore || dateTime > cert.validity.notAfter
    );
  }

  static readableCert(self: ProxyCertAuthority): Readable {
    return Readable.from(Buffer.from(self.cert));
  }
}

function generateSerialNumber(): string {
  // hexadecimal serial number of at most 20 octets, and preferably positive.
  // starting with A should get a positive number
  return 'A' + randomBytes(18).toString('hex').toUpperCase();
}

class TransparentProxy {
  server: httpolyglot.Server;
  port?: number;
  url?: string;
  tunnelAbort: AbortController;
  tlsEnabled: boolean;
  serverDestroy: (cb: (err?: Error) => void) => void;

  constructor(
    targetHost: string,
    captureRequest: http.RequestListener,
    capturingServer: net.Server,
    options: {
      https?: tls.SecureContextOptions;
    } = {}
  ) {
    this.server = httpolyglot.createServer(
      {
        ALPNProtocols: ['http/1.1'],
        ...(options.https ? options.https : {}),
      },
      captureRequest
    );

    this.serverDestroy = destroyCommandForServer(this.server);

    this.tlsEnabled = !!options.https;

    events.setMaxListeners(Infinity);
    events.defaultMaxListeners = Infinity;
    const tunnelAbort = (this.tunnelAbort = new AbortController()); // control aborting of tunnels separately
    // small hack to prevent warnings, because the AbortController polyfill doesn't setup EventEmitter according to spec
    // @ts-ignore
    if (tunnelAbort.signal.eventEmitter) {
      // @ts-ignore
      (tunnelAbort.signal.eventEmitter as EventEmitter).setMaxListeners(
        Infinity
      );
    }

    let [targetHostname, targetPort] = targetHost.split(':');

    this.server.on(
      'connect',
      (
        req: http.IncomingMessage | http2.Http2ServerRequest,
        resOrSocket: net.Socket | http2.Http2ServerResponse,
        reqHead: Buffer
      ) => {
        if (resOrSocket instanceof net.Socket) {
          let clientSocket = resOrSocket;
          // clients disconnecting causes errors, but there's not much to do for us
          // than the default behaviour of stopping the tunnel
          clientSocket.once('error', (err) => {
            if (isTransitiveSocketError(err)) {
              // connections get broken sometimes, nothing special
              clientSocket.destroy();
              log.info(
                'Handled error on client socket by destroying it: %s',
                err
              );
              return;
            }

            this.server.emit('error', err); // forward any errors we can't handle
          });
          destroySocketOnAbort(clientSocket, tunnelAbort.signal);

          if (!req.url) {
            // TODO: see if we could go just of the `host` header
            clientSocket.write(
              `HTTP/${req.httpVersion} 400 Bad Request\r\n\r\n`,
              'utf-8'
            );
            clientSocket.end();
            return;
          }

          const { port, host, hostname } = new URL(`http://${req.url}`);
          if (
            host !== targetHost &&
            !(
              targetHostname === hostname &&
              (port === targetPort ||
                (!targetPort && port === '80') ||
                (!targetPort && port === '443'))
            )
          ) {
            // transparently tunnel all non-target traffic directly through TCP sockets
            log.info('transparently tunneling connection to %s', host);
            const serverSocket = net.connect(
              (port && parseInt(port)) || 80,
              hostname,
              () => {
                log.info('tunnel to %s established', host);
                clientSocket.once('error', (err) => {
                  serverSocket.destroy();
                });

                clientSocket.write(
                  `HTTP/${req.httpVersion} 200 Connection Established\r\nProxy-agent: Optic Transparent proxy\r\n\r\n`
                );
                serverSocket.write(reqHead);
                clientSocket.pipe(serverSocket);
                serverSocket.pipe(clientSocket);
              }
            );

            serverSocket.once('error', (err) => {
              let errorCode = isCodedError(err) ? err.code : null;

              if (
                (errorCode === 'ENOTFOUND' || errorCode === 'ECONNREFUSED') &&
                serverSocket.connecting
              ) {
                clientSocket.write(
                  `HTTP/${req.httpVersion} 502 Bad Gateway\r\nProxy-agent: Optic Transparent proxy\r\n\r\n`
                );
                log.notice(
                  'tunnel to %s could not be established: %s',
                  host,
                  errorCode
                );
                return;
              } else if (errorCode === 'ETIMEDOUT' && serverSocket.connecting) {
                clientSocket.write(
                  `HTTP/${req.httpVersion} 504 Gateway Timeout\r\nProxy-agent: Optic Transparent proxy\r\n\r\n`
                );
                log.notice(
                  'tunnel to %s could not be established: %s',
                  host,
                  errorCode
                );
                return;
              } else if (isTransitiveSocketError(err)) {
                // connections get broken sometimes, nothing special
                clientSocket.destroy();
                log.info('tunnel to %s interrupted: %s', host, errorCode);
                return;
              }

              this.server.emit('error', err); // forward error to transparentProxy server, give downstream a chance to handle it
            });
            destroySocketOnAbort(serverSocket, tunnelAbort.signal);
          } else {
            log.notice('capturing connection to target (%s)', host);
            // tunnel target traffic to the capturing proxy
            // @ts-ignore
            clientSocket.write(
              `HTTP/${req.httpVersion} 200 Connection Established\r\nProxy-agent: Optic Transparent proxy\r\n\r\n`
            );
            capturingServer.emit('connection', clientSocket);
          }
        } else {
          throw new Error('HTTP/2 CONNECT unimplemented');
        }
      }
    );
  }

  start(port: number): Promise<void> {
    const server = this.server;

    return new Promise<void>((resolve, reject) => {
      const onListening = () => {
        cleanup();
        this.port = port;
        this.url = `${this.tlsEnabled ? 'https' : 'http'}://localhost:${port}`;
        resolve();
      };

      const onListenError = (err: Error) => {
        let errorCode = isCodedError(err) && err.code;
        if (errorCode && errorCode === 'EADDRINUSE') {
          // port got taken since we last found it as un-used, try again
          log.notice('attempting another port for transparentProxy');
          portfinder
            .getPortPromise({
              port: 8000,
              stopPort: 8999,
            })
            .then((availablePort) => {
              port = availablePort;
              server.close();
              server.listen(port);
            });
        } else {
          cleanup();
          reject(err);
        }
      };

      const cleanup = () => {
        this.server.removeListener('listening', onListening);
        this.server.removeListener('error', onListenError);
      };

      server.on('listening', onListening);
      server.on('error', onListenError);
      server.listen(port);
    });
  }

  stop(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.serverDestroy((err) => {
        // stops accepting new connections, waits for tunnels to finish
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
      this.tunnelAbort.abort(); // abort all open tunnels so tunneling proxy can close
    });
  }
}

function destroySocketOnAbort(socket: net.Socket, abort: AbortSignal) {
  socket.once('close', (err) => {
    abort.removeEventListener('abort', onAbort);
  });

  abort.addEventListener('abort', onAbort);

  function onAbort() {
    if (!socket.destroyed) socket.destroy();
  }
}

function isCodedError(
  error: Error & { code?: string }
): error is Error & { code: string } {
  return typeof error.code === 'string';
}

function isTransitiveSocketError(err: Error) {
  return isCodedError(err) && transitiveSocketErrors.includes(err.code);
}

const transitiveSocketErrors = Object.freeze([
  'ECONNRESET',
  'ENOTFOUND',
  'EPIPE',
  'ETIMEDOUT',
]);

function destroyCommandForServer(server: httpolyglot.Server) {
  let connections = {};

  server.on('connection', function (conn) {
    var key = conn.remoteAddress + ':' + conn.remotePort;
    connections[key] = conn;
    conn.on('close', function () {
      delete connections[key];
    });
  });

  return function (cb: (err?: Error) => void) {
    server.close(cb);
    for (var key in connections) connections[key].destroy();
  };
}
