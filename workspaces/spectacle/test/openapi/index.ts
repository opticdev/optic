// @ts-ignore
import Tap from 'tap';
import { makeSpectacle } from '../../src';
import { loadEvents } from '../utils';
import { InMemoryOpticContextBuilder } from '../../src/in-memory';
import * as OpticEngine from '../../../optic-engine-wasm/build';
import { generateOpenApi } from '../../src/openapi';

const specs = [
  {
    name: 'generate OpenAPI 3.0.1',
    file: './test/specs/mark-req-nested-field-optional.json',
  },
  {
    name: 'handle contributions',
    file: './test/specs/contributions.json',
  },
];

specs.forEach(({ name, file }) => {
  Tap.test(name, async (test) => {
    const events = loadEvents(file);
    const opticContext = await InMemoryOpticContextBuilder.fromEvents(
      OpticEngine,
      events
    );
    const spectacle = await makeSpectacle(opticContext);
    const results = await generateOpenApi(spectacle);
    test.matchSnapshot(results);
  });
});
