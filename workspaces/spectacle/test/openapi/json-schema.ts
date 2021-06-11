// @ts-ignore
import Tap from 'tap';
import { makeSpectacle } from '../../src';
import * as OpticEngine from '@useoptic/optic-engine-wasm';
import { InMemoryOpticContextBuilder } from '../../src/in-memory';
import { jsonSchemaFromShapeId } from '../../src/openapi/json-schema';
import { loadEvents } from '../utils';

Tap.test('generate JSON schemas for objects', async (test) => {
  const events = loadEvents('./test/specs/mark-req-nested-field-optional.json');
  const shapeId = 'shape_Uepabr07Dx';
  const opticContext = await InMemoryOpticContextBuilder.fromEvents(
    OpticEngine,
    events
  );
  const spectacle = await makeSpectacle(opticContext);
  const results = await jsonSchemaFromShapeId(spectacle, shapeId);
  test.matchSnapshot(results);
});

Tap.test('generate JSON schemas for arrays', async (test) => {
  const events = loadEvents('./test/specs/add-res-as-array-with-object.json');
  const shapeId = 'shape_oCUwskX7xA';
  const opticContext = await InMemoryOpticContextBuilder.fromEvents(
    OpticEngine,
    events
  );
  const spectacle = await makeSpectacle(opticContext);
  const results = await jsonSchemaFromShapeId(spectacle, shapeId);
  test.matchSnapshot(results);
});

Tap.test(
  'generate JSON schemas for arrays with multiple types',
  async (test) => {
    const events = loadEvents('./test/specs/update-res-as-array.json');
    const shapeId = 'shape_Sn2bnZvvoM';
    const opticContext = await InMemoryOpticContextBuilder.fromEvents(
      OpticEngine,
      events
    );
    const spectacle = await makeSpectacle(opticContext);
    const results = await jsonSchemaFromShapeId(spectacle, shapeId);
    test.matchSnapshot(results);
  }
);
