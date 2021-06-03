import Tap from 'tap';
import * as OpticEngine from '@useoptic/optic-engine-wasm/build';

Tap.test('OpticEngine spec_from_events', async (test) => {
  let spec = OpticEngine.spec_from_events('[]');

  test.ok(spec);
});
