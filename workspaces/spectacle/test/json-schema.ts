import * as fs from 'fs';
// @ts-ignore
import Tap from 'tap';
import { makeSpectacle } from '../src';
import * as OpticEngine from '@useoptic/diff-engine-wasm/engine/build';
import { InMemoryOpticContextBuilder } from '../src/in-memory';

// TODO: add to test utils
function loadEvents(file: string) {
  return JSON.parse(fs.readFileSync(file).toString('utf-8'));
}

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

//-----------------------------

async function jsonSchemaFromShapeId(
  spectacle: any,
  shapeId: string
): Promise<JsonSchema> {
  const shape = await queryForShape(spectacle, shapeId);

  // We ignore Undefined here because we check in when dealing with Object
  const shapeChoices = shape.data.shapeChoices.filter(
    (shapeChoice: any) => shapeChoice.jsonType !== 'Undefined'
  );

  const results: JsonSchema[] = await Promise.all(
    shapeChoices.map(async (shapeChoice: any) => {
      return await jsonSchemaFromShapeChoice(spectacle, shapeChoice);
    })
  );

  if (results.length === 1) return results[0];

  // In some cases, it might be nicer to do { type: [string, number] }, but this
  // isn't supported in OpenAPI. Leaving it as oneOf for now.
  return { oneOf: results };
}

async function jsonSchemaFromShapeChoice(
  spectacle: any,
  shapeChoice: any
): Promise<JsonSchema> {
  if (shapeChoice.jsonType === 'Object') {
    const result: JsonSchemaObject = {
      type: 'object',
      properties: {},
      required: [],
    };

    for (const field of shapeChoice.asObject.fields) {
      result.properties[field.name] = (await jsonSchemaFromShapeId(
        spectacle,
        field.shapeId
      )) as any;

      let isRequired = true;

      // We look down into the field shape choices to see if Undefined shows up
      // anywhere. If we find one, we don't mark the field as required.
      const fieldShape = await queryForShape(spectacle, field.shapeId);
      for (const shapeChoice of (fieldShape as any).data.shapeChoices) {
        if (shapeChoice.jsonType === 'Undefined') {
          isRequired = false;
          break;
        }
      }

      if (isRequired) result.required.push(field.name);
    }

    return result;
  }

  if (shapeChoice.jsonType === 'Array') {
    const itemSchema = await jsonSchemaFromShapeId(
      spectacle,
      shapeChoice.asArray.shapeId
    );

    let items;

    // Instead of having a single oneOf in the items array, this flattens it to
    // make it an array for each type in the oneOf.
    if ('oneOf' in itemSchema) {
      items = itemSchema.oneOf;
    } else {
      items = [itemSchema];
    }

    return {
      type: 'array',
      items,
    };
  }

  if (shapeChoice.jsonType === 'String') {
    return { type: 'string' };
  }

  if (shapeChoice.jsonType === 'Number') {
    return { type: 'number' };
  }

  if (shapeChoice.jsonType === 'Boolean') {
    return { type: 'boolean' };
  }

  throw new TypeError(`Unknown JSON type ${shapeChoice.jsonType}`);
}

async function queryForShape(spectacle: any, shapeId: string) {
  return await spectacle.queryWrapper({
    query: `query GetShape($shapeId: ID!) {
      shapeChoices(shapeId: $shapeId) {
        jsonType
        asArray {
          shapeId
        }
        asObject {
          fields {
            shapeId
            name
          }
        }
      }
    }`,
    variables: { shapeId },
  });
}

type JsonSchema =
  | JsonSchemaObject
  | JsonSchemaArray
  | JsonSchemaValue
  | JsonSchemaOneOf;

type JsonSchemaObject = {
  type: 'object';
  properties: {
    [property: string]: JsonSchema;
  };
  required: string[];
};

type JsonSchemaArray = {
  type: 'array';
  items: JsonSchema[];
};

type JsonSchemaValue =
  | { type: 'string' }
  | { type: 'number' }
  | { type: 'boolean' };

type JsonSchemaOneOf = {
  oneOf: JsonSchema[];
};
