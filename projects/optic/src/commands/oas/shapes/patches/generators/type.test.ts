import { it, describe, expect } from '@jest/globals';
import { SchemaObject } from '../..';
import { diffBodyBySchema } from '../../diffs';
import { generateShapePatchesByDiff } from '..';

describe('type shape patch generator', () => {
  const jsonSchema: SchemaObject = {
    type: 'object',
    properties: {
      stringField: { type: 'string' },
    },
  };

  it('when provided with another primitive, it can apply patches', () => {
    const input = {
      stringField: 123,
    };

    const diffs = [...diffBodyBySchema({ value: input }, jsonSchema)];

    const patches = diffs.flatMap((diff) => [
      ...generateShapePatchesByDiff(diff, jsonSchema, {}, '3.1.x'),
    ]);

    expect(patches).toMatchSnapshot();
  });

  it('when provided with an array, it can apply patches', () => {
    const input = {
      stringField: ['1', '2', '3', true],
    };

    const diffs = [...diffBodyBySchema({ value: input }, jsonSchema)];

    const patches = diffs.flatMap((diff) => [
      ...generateShapePatchesByDiff(diff, jsonSchema, {}, '3.1.x'),
    ]);

    expect(patches).toMatchSnapshot();
  });

  it('when provided with an object, it can apply patches', () => {
    const input = {
      stringField: { field: 'string' },
    };

    const diffs = [...diffBodyBySchema({ value: input }, jsonSchema)];

    const patches = diffs.flatMap((diff) => [
      ...generateShapePatchesByDiff(diff, jsonSchema, {}, '3.1.x'),
    ]);

    expect(patches).toMatchSnapshot();
  });

  it('when provided with null value, it can apply patches', () => {
    const input: any = {
      stringField: null,
    };

    const diffs = [...diffBodyBySchema({ value: input }, jsonSchema)];

    const patches = diffs.flatMap((diff) => [
      ...generateShapePatchesByDiff(diff, jsonSchema, {}, '3.1.x'),
    ]);

    expect(patches).toMatchSnapshot();
  });
});
