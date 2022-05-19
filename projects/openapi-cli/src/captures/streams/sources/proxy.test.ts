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
  });
});
