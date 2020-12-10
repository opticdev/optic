import Tap from 'tap';
import * as DiffEngine from '../../build';

Tap.test('DiffEngine', async (test) => {
  let spec = DiffEngine.spec_from_events('[]');

  test.ok(spec);
});
