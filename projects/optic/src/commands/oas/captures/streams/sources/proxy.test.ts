import { it, describe, expect, beforeAll, afterAll } from '@jest/globals';

import { ProxyCertAuthority, ProxyInteractions } from './proxy';
import * as mockttp from 'mockttp';
import bent from 'bent';
import { collect } from '../../../lib/async-tools';
import fetch from 'node-fetch';
import https from 'https';
import UrlJoin from 'url-join';
import { httpsOverHttp } from 'tunnel';

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
      abortController.signal,
      { mode: 'reverse-proxy' }
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
      abortController.signal,
      { mode: 'reverse-proxy' }
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
      {
        ca: proxyCa,
        targetCA: [targetCA],
        mode: 'reverse-proxy',
      }
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

  it('will transparently tunnel requests to non-target hosts through HTTP CONNECT', async () => {
    // non-target server with a different CA (as it would out in the wild)
    let nonTargetCA = await mockttp.generateCACertificate();
    let nonTargetServer = mockttp.getLocal({
      https: nonTargetCA,
    });
    await nonTargetServer
      .forGet('/another-path')
      .always()
      .thenReply(200, 'Other server response');
    await nonTargetServer.start();

    // setup proxy
    const ca = await ProxyCertAuthority.generate();
    const abortController = new AbortController();
    const [interactions, proxyUrl] = await ProxyInteractions.create(
      target.url,
      abortController.signal,
      {
        ca,
        targetCA: [targetCA],
        mode: 'reverse-proxy',
      }
    );
    let transparentPort = parseInt(new URL(proxyUrl).port);

    // make call using http CONNECT
    const tunnelAgent = httpsOverHttp({
      proxy: {
        host: 'localhost',
        port: transparentPort,
      },
      ca: [Buffer.from(nonTargetCA.cert)],
    });
    const requestUrl = UrlJoin(nonTargetServer.url, '/another-path');
    const response = await fetch(requestUrl, { agent: tunnelAgent });
    expect(response.ok).toBe(true);
    expect(await response.text()).toBe('Other server response');

    // collections interactions
    abortController.abort();
    let capturedInteractions = await collect(interactions);
    expect(capturedInteractions).toHaveLength(0);

    // teardown
    await nonTargetServer.stop();
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
        headersSentTimestamp: expect.any(Number),
        responseSentTimestamp: expect.any(Number),
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
