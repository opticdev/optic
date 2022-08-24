import * as mockttp from 'mockttp';
import {
  CompletedRequest,
  CompletedResponse,
  CompletedBody,
  TimingEvents,
} from 'mockttp';
import { Subject } from '../../../lib/async-tools';
import { AbortSignal } from 'node-abort-controller'; // remove when Node v14 is out of LTS
import { Result, Ok, Err } from 'ts-results';
import { pki, md } from 'node-forge';
import { randomBytes } from 'crypto';

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
    await proxy.on('response', (capturedResponse) => {
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
  interface Response extends Omit<CompletedResponse, 'tags' | 'body'> {
    timingEvents: TimingEvents;
    body: Body;
  }

  type Body = Pick<CompletedBody, 'buffer'>;
}

export interface ProxyCertAuthority {
  cert: Buffer;
  key: Buffer;
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
      cert: Buffer.from(pki.certificateToPem(cert)),
      key: Buffer.from(pki.privateKeyToPem(keyPair.privateKey)),
    };
  }

  static fromReadables(
    certSource,
    keySource
  ): Result<ProxyCertAuthority, string> {
    return Err('not yet implemented');
  }
}

function generateSerialNumber(): string {
  // hexadecimal serial number of at most 20 octets, and preferably positive.
  // starting with A should get a positive number
  return 'A' + randomBytes(18).toString('hex').toUpperCase();
}
