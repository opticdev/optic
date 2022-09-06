import { ProxyCertAuthority, ProxyInteractions } from './proxy';
import * as mockttp from 'mockttp';
import bent from 'bent';
import { collect } from '../../../lib/async-tools';
import { AbortController } from 'node-abort-controller'; // remove when Node v14 is out of LTS
import fetch from 'node-fetch';
import https from 'https';
import UrlJoin from 'url-join';

describe('ProxyInteractions', () => {
  let target: mockttp.Mockttp;
  beforeAll(async () => {
    target = mockttp.getLocal();
    await target.forGet('/some-path').thenReply(200, 'Test response');
    await target.forDelete('/some-path').thenReply(204);
    await target.start();
  });

  afterAll(async () => {
    await target.stop();
  });

  it('captures requests and responses, proxied to a target server', async () => {
    const abortController = new AbortController();
    const [interactions, proxyUrl] = await ProxyInteractions.create(
      target.url,
      abortController.signal
    );

    const get = bent(proxyUrl);
    const response = (await get('/some-path', 'string')) as bent.BentResponse;

    expect(await response.text()).toBe('Test response');

    abortController.abort();

    let capturedInteractions = await collect(interactions);

    expect(capturedInteractions).toHaveLength(1);

    expect(capturedInteractions[0]).toMatchSnapshot(matchProxyInteraction());
  });

  it('encodes non-existing request / respons bodies as empty buffers', async () => {
    const abortController = new AbortController();
    const [interactions, proxyUrl] = await ProxyInteractions.create(
      target.url,
      abortController.signal
    );

    const requestDelete = bent(proxyUrl, 'DELETE', 204);
    await requestDelete('/some-path');

    abortController.abort();

    let capturedInteractions = await collect(interactions);

    expect(capturedInteractions).toHaveLength(1);

    const [interaction] = capturedInteractions;

    expect(interaction.request.body.buffer).toHaveLength(0);
    expect(interaction.response.body.buffer).toHaveLength(0);
  });
});

describe('ProxyCertAuthority', () => {
  it('can generate a self-signed CA certificate', async () => {
    await ProxyCertAuthority.generate();
  });
});

describe('ProxyInteractions with tls', () => {
  let target: mockttp.Mockttp;
  let targetCA: { cert: string; key: string };
  beforeAll(async () => {
    targetCA = await mockttp.generateCACertificate();
    target = mockttp.getLocal({
      https: targetCA,
    });
    await target.forGet('/some-path').thenReply(200, 'Test response');
    await target.start();
  });
  afterAll(async () => {
    await target.stop();
  });

  it('will generate domain certificates given a ProxyCertAuthority and capture requests', async () => {
    const proxyCa = await ProxyCertAuthority.generate();
    const abortController = new AbortController();
    const [interactions, proxyUrl] = await ProxyInteractions.create(
      target.url,
      abortController.signal,
      { ca: proxyCa, targetCA: [targetCA] }
    );

    let httpsAgent = new https.Agent({
      ca: proxyCa.cert, // except the CA of the proxy
    });
    let requestUrl = UrlJoin(proxyUrl, '/some-path');

    const response = await fetch(requestUrl, {
      agent: httpsAgent,
    });
    abortController.abort();

    expect(response.ok).toBe(true);
    expect(await response.text()).toBe('Test response');

    let capturedInteractions = await collect(interactions);

    expect(capturedInteractions).toHaveLength(1);
  });
});

function matchProxyInteraction() {
  return {
    request: {
      id: expect.any(String),
      rawHeaders: expect.any(Array),
      timingEvents: {
        startTime: expect.any(Number),
        startTimestamp: expect.any(Number),
        bodyReceivedTimestamp: expect.any(Number),
      },
    },
    response: {
      id: expect.any(String),
      headers: {
        date: expect.any(String),
      },
      rawHeaders: expect.any(Array),
      timingEvents: {
        startTime: expect.any(Number),
        startTimestamp: expect.any(Number),
        bodyReceivedTimestamp: expect.any(Number),
        headersSentTimestamp: expect.any(Number),
        responseSentTimestamp: expect.any(Number),
      },
    },
  };
}
