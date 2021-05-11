// @ts-ignore
import Tap from 'tap';
import { makeSpectacle } from '../../src';
import { loadEvents } from '../utils';
import { InMemoryOpticContextBuilder } from '../../src/in-memory';
import * as OpticEngine from '../../../diff-engine-wasm/engine/build';
import { generateOpenApi } from '../../src/openapi';

Tap.test('generate OpenAPI 3.0.1', async (test) => {
  const events = loadEvents('./test/specs/mark-req-nested-field-optional.json');
  const opticContext = await InMemoryOpticContextBuilder.fromEvents(
    OpticEngine,
    events
  );
  const spectacle = await makeSpectacle(opticContext);
  const results = await generateOpenApi(spectacle);
  test.matchSnapshot(results);
});
