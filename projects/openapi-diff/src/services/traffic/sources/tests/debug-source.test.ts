import { DebugSource } from '../debug-implementations';
import { makeExample } from '../../traffic/debug-simple';
import { ApiTraffic } from '../../types';
import { waitFor } from '../../../../utils/debug_waitFor';

describe('debug sources', () => {
  it('can iterate provided traffic', async () => {
    const source = new DebugSource(
      [
        makeExample('/examples', 'get', '200'),
        makeExample('/examples', 'get', '200'),
        makeExample('/examples/:todoId', 'get', '200'),
        makeExample('/examples', 'post', '404'),
      ],
      10
    );

    const examples: ApiTraffic[] = [];
    source.on('traffic', (example) => {
      examples.push(example);
    });
    await source.start();

    await waitFor(300);

    expect(examples).toMatchSnapshot();
  });
});
