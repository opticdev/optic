import { it, describe, expect } from '@jest/globals';
import { diffBodyBySchema } from '../../diff';
import { generateShapePatchesByDiff } from '../../patches';
import { SchemaObject } from '../../schema';
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

describe('enum json schema diff visitor', () => {
  const jsonSchema: SchemaObject = {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['ready', 'not_ready'] },
    },
  };

  it('when valid, no diff', () => {
    const input = {
      status: 'ready',
    };
    const diffs = diffBodyBySchema({ value: input }, jsonSchema);
    expect([...diffs]).toHaveLength(0);
  });

  it('when missing enum value', () => {
    const input = {
      status: 'new-field',
    };
    const diffs = [...diffBodyBySchema({ value: input }, jsonSchema)];
    expect(diffs).toHaveLength(1);
    expect(diffs).toMatchSnapshot();
  });
});

describe('enum shape patch generator', () => {
  const jsonSchema: SchemaObject = {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['ready', 'not_ready'] },
      other: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ready', 'not_ready'] },
          },
        },
      },
    },
  };

  it('when missing an enum', () => {
    const input = {
      status: 'new-field',
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

  it('when enum is nested in array', () => {
    const input = {
      other: [
        {
          status: 'new-field',
        },
      ],
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
