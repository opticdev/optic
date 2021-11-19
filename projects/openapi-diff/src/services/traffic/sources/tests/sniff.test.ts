import os from 'os';

import fetch from 'node-fetch';

import { SnifferSource, SnifferConfig } from '../sniffer';
import { ApiTraffic } from '../../types';
import { waitFor } from '../../../../utils/debug_waitFor';

const rootOnlyIt = os.userInfo().uid == 0 ? it : it.skip;

// TODO: don't skip this unless we are not root. Also print a nice message.
describe('capture sources', () => {
  rootOnlyIt('can parse captured traffic', async () => {
    // TODO: Set port correctly
    const source = new SnifferSource({ interface: 'en0', port: 80 });

    const examples: ApiTraffic[] = [];
    source.on('traffic', (example) => {
      //console.log(example);
      examples.push(example);
    });

    await source.start();

    for (var i = 0; i < 4; i++) {
      await fetch(`http://httpbin.org/get?i=${i}`);
    }

    await waitFor(300);
    await source.stop();

    expect(JSON.stringify(examples)).toMatchSnapshot();
  });
});
