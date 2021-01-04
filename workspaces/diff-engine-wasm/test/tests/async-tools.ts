import Tap from 'tap';
import { spy } from 'sinon';

import * as AT from '../../src/async-tools';

Tap.test('AsyncTools.lastBy', async (t) => {
  await t.test(
    'will only emit the last occurence of each result by key returned by predicate, in order of last key occurence',
    async (t) => {
      interface Item {
        name: string;
        count: number;
      }

      const testInput: Item[] = [
        { name: 'a', count: 1 },
        { name: 'b', count: 1 },
        { name: 'a', count: 2 },
        { name: 'c', count: 1 },
        { name: 'b', count: 5 },
      ];

      const predicate = spy((item: Item) => item.name);
      const lastByName = AT.lastBy(predicate);

      const lastInputsByName = lastByName(AT.from(testInput));

      let results = await AT.toArray<Item>(lastInputsByName);

      t.deepEqual(results, [
        { name: 'a', count: 2 },
        { name: 'c', count: 1 },
        { name: 'b', count: 5 },
      ]);
      t.equal(predicate.callCount, testInput.length);

      // verify last by generator is pure
      predicate.resetHistory();
      const otherTestInputs: Item[] = [
        { name: 'd', count: 2 },
        { name: 'e', count: 1 },
        { name: 'f', count: 5 },
      ];

      const otherInputsByName = lastByName(AT.from(otherTestInputs));
      results = await AT.toArray<Item>(otherInputsByName);

      t.deepEqual(results, otherTestInputs);
      t.equal(predicate.callCount, otherTestInputs.length);
    }
  );
});
