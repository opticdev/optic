import * as mockttp from 'mockttp';
import {
  CompletedRequest,
  CompletedResponse,
  CompletedBody,
  TimingEvents,
} from 'mockttp';
import { Subject } from '../../../lib/async-tools';
import { AbortSignal } from 'node-abort-controller'; // remove when Node v14 is out of LTS
import { pki, md } from 'node-forge';
import { randomBytes } from 'crypto';
import { Readable } from 'stream';
import http from 'http';
import http2 from 'http2';
import net from 'net';
import * as httpolyglot from '@httptoolkit/httpolyglot';
import { URL } from 'url';

export interface ProxyInteractions
  extends AsyncIterable<ProxySource.Interaction> {}

export class ProxyInteractions {
  static async create(
    targetHost: string,
    abort: AbortSignal, // required, we don't want to ever let a proxy run indefinitely
    options: {
      ca?: ProxyCertAuthority;
      targetCA?: Array<{ cert: Buffer | string }>;
    } = {}
  ): Promise<[ProxyInteractions, string]> {
    const capturingProxy = mockttp.getLocal({
      cors: false,
      debug: false,
      recordTraffic: false,
      https: options.ca && {
        cert: options.ca.cert.toString(),
        key: options.ca.key.toString(),
      },
    });

    capturingProxy.addRequestRules({
      matchers: [new mockttp.matchers.WildcardMatcher()],
      handler: new mockttp.requestHandlers.PassThroughHandler({
        trustAdditionalCAs: options.targetCA || [],
        forwarding: {
          targetHost,
          updateHostHeader: true,
        },
      }),
    });

    capturingProxy.addWebSocketRules({
      matchers: [new mockttp.matchers.WildcardMatcher()],
      handler: new mockttp.webSocketHandlers.PassThroughWebSocketHandler({
        trustAdditionalCAs: options.targetCA || [],
        forwarding: {
          targetHost,
        },
      }),
    });

    const interactions = new Subject<ProxySource.Interaction>();

    const requestsById = new Map<string, ProxySource.Request>();
    // TODO: figure out if we can use OngoingRequest instead of captured, at which body
    // hasn't been parsed yet and is available as stream
    await capturingProxy.on('request', (capturedRequest) => {
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
    });

    // TODO: figure out if we can use OngoingRequest instead of captured, at which body
    // hasn't been parsed yet and is available as stream
    await capturingProxy.on('response', (capturedResponse) => {
      const { id } = capturedResponse;
      const request = requestsById.get(id);
      if (!request) return;

      const { tags, body, timingEvents, ...rest } = capturedResponse;

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
    });

    abort.addEventListener('abort', onAbort);

    interactions.finally(() => {
      abort.removeEventListener('abort', onAbort);
    });

    function onAbort(e) {
      interactions.onCompleted();
    }

    await capturingProxy.start();

    // sits in front of the capturing proxy to only direct target host traffic
    // and transparently forward the rest
    const transparentProxy = httpolyglot.createServer((req, res) => {
      // TODO: figure out if we can forward direct requests somewhere, somehow
      res.writeHead(400, 'Bad request');
      res.end();
    });

    let [targetHostname, targetPort] = targetHost.split(':');

    transparentProxy.on(
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
            console.error('Error on client socket', err); // TODO: don't yell out this error.
          });

          if (!req.url) {
            // TODO: see if we could go just of the `host` header
            clientSocket.write(
              `HTTP/${req.httpVersion} 400 Bad Request\r\n\r\n`,
              'utf-8'
            );
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
            console.log('transparently tunneling connection to', host);
            const serverSocket = net.connect(
              (port && parseInt(port)) || 80,
              hostname,
              () => {
                clientSocket.once('error', () => {
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
              // TODO: figure out if this is right
              console.error('Error on server socket', err);
              clientSocket.destroy();
            });
          } else {
            console.log('capturing connection to', host);
            // tunnel target traffic to the capturing proxy
            // @ts-ignore
            let capturingServer = capturingProxy.server as net.Server;
            clientSocket.write(`HTTP/${req.httpVersion}`);
            capturingServer.emit('connection', clientSocket);
          }
        } else {
          throw new Error('HTTP/2 CONNECT unimplemented');
        }
      }
    );

    let transparentPort = capturingProxy.port + 1; // TODO: look for available port more resiliently
    transparentProxy.listen(transparentPort, () => {
      console.log('Transparent proxy running on ' + transparentPort);
    });
    let transparentProxyUrl = `http://localhost:${transparentPort}`;

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

    cert.validity.notBefore = new Date();
    cert.validity.notBefore.setDate(cert.validity.notBefore.getDate() - 1); // account for wonky time keeping
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setDate(cert.validity.notAfter.getDate() + 30);

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
