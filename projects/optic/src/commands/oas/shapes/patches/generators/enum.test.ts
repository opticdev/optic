import { it, describe, expect } from '@jest/globals';
import { SchemaObject } from '../..';
import { diffBodyBySchema } from '../../diffs';
import { generateShapePatchesByDiff } from '..';
import { objectOrStringOneOf } from '../../../tests/fixtures/oneof-schemas';

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
      ...generateShapePatchesByDiff(diff, jsonSchema, {}, '3.1.x'),
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
      ...generateShapePatchesByDiff(diff, jsonSchema, {}, '3.1.x'),
    ]);

    expect(patches).toMatchSnapshot();
  });
});
