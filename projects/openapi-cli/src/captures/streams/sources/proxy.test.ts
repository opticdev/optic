import { ProxyInteractions } from './proxy';
import * as mockttp from 'mockttp';
import bent from 'bent';
import { collect } from '../../../lib/async-tools';

describe('ProxyInteractions', () => {
  let target: mockttp.Mockttp;
  beforeAll(async () => {
    target = mockttp.getLocal();
    await target.forGet('/some-path').thenReply(200, 'Test response');
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
