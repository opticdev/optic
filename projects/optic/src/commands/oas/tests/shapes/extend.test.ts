import { it, describe, expect } from '@jest/globals';
import { SchemaObject, ShapePatches, Schema } from '../../shapes';
import { diffBodyBySchema } from '../../shapes/diffs';

import * as DocumentedBodyFixtures from '../fixtures/documented-body';

function patchSchema(
  schema: SchemaObject | null,
  ...inputs: any[]
): SchemaObject | null {
  for (let input of inputs) {
    let body = DocumentedBodyFixtures.jsonBody(input);
    body.schema = schema;
    let patches = ShapePatches.generateBodyAdditions(body, '3.1.x');

    for (let patch of patches) {
      schema = Schema.applyShapePatch(schema, patch);
    }
  }

  return schema;
}

function* diffs(schema: SchemaObject | null, ...inputs: any[]) {
  if (!schema) return;
  for (let input of inputs) {
    yield* diffBodyBySchema({ value: input }, schema);
  }
}

describe('extending existing schemas', () => {
  it('can add type to typeless shapes from body', () => {
    const input = {
      hello: 'world',
      age: 145,
    };

    const typelessSchema: SchemaObject = {
      properties: {
        hello: {
          type: 'string',
          example: 'you',
        },
        age: {
          type: 'number',
          example: 9,
        },
      },
    };

    const result = patchSchema(typelessSchema, input);
    expect(result).toMatchSnapshot();
    expect([...diffs(result, input)]).toHaveLength(0);
  });
});
