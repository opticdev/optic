import { it, describe, expect } from '@jest/globals';
import { SchemaObject } from '../..';
import { diffValueBySchema } from '../../diffs';
import { generateShapePatchesByDiff } from '..';

describe('required shape patch generator', () => {
  const jsonSchema: SchemaObject = {
    type: 'object',
    properties: {
      hello: {
        type: 'object',
        required: ['f1', 'f2', 'f3'],
        properties: {
          f1: { type: 'string' },
          f2: { type: 'number' },
          f3: { type: 'object' },
        },
      },
    },
  };

  it("missing required fields will patch as 'make optional' or 'remove'", () => {
    const input = {
      hello: { f1: 'value', f2: 122 },
    };
    const diffs = [...diffValueBySchema(input, jsonSchema)];

    const patches = diffs.flatMap((diff) => [
      ...generateShapePatchesByDiff(diff, jsonSchema, {}, '3.1.x'),
    ]);

    expect(patches).toMatchSnapshot();
  });
});
