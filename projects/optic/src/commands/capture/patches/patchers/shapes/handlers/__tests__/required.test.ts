import { it, describe, expect } from '@jest/globals';
import { generateShapePatchesByDiff } from '../../patches';
import { SchemaObject } from '../../schema';
import { diffBodyBySchema } from '../../diff';
import { CapturedInteraction } from '../../../../../sources/captured-interactions';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
const mockInteraction: CapturedInteraction = {
  request: {
    host: '',
    path: '',
    method: OpenAPIV3.HttpMethods.GET,
    body: null,
    headers: [],
    query: [],
  },
};
describe('required json schema diff visitor', () => {
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

  it("missing required fields'", () => {
    const input = {
      hello: { f1: 'value', f2: 122 },
    };

    const diffs = diffBodyBySchema({ value: input }, jsonSchema);

    expect([...diffs]).toMatchSnapshot();
  });
});

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
    const diffs = [...diffBodyBySchema({ value: input }, jsonSchema)];

    const patches = diffs.flatMap((diff) => [
      ...generateShapePatchesByDiff(
        diff,
        jsonSchema,
        mockInteraction,
        {},
        '3.1.x'
      ),
    ]);

    expect(patches).toMatchSnapshot();
  });
});
