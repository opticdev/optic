import { it, describe, expect } from '@jest/globals';
import { SchemaObject } from '../..';
import { diffBodyBySchema } from '../../diffs';
import { generateShapePatchesByDiff } from '..';
import { objectOrStringOneOf } from '../../../tests/fixtures/oneof-schemas';

describe('one of shape patch generator', () => {
  const jsonSchema: SchemaObject = {
    type: 'object',
    properties: {
      polyProp: {
        oneOf: [{ type: 'string' }, { type: 'number' }],
      },
    },
  };

  it('when new primitive types provided to existing one of ', () => {
    const input = {
      polyProp: true,
    };

    const diffs = [...diffBodyBySchema({ value: input }, jsonSchema)];

    const patches = diffs.flatMap((diff) => [
      ...generateShapePatchesByDiff(diff, jsonSchema, {}, '3.1.x'),
    ]);

    expect(patches).toMatchSnapshot();
  });

  it('when new field in one of object variant of one of', () => {
    const jsonSchema: SchemaObject = {
      type: 'object',
      properties: {
        polyProp: {
          oneOf: [{ type: 'object', properties: {} }, { type: 'number' }],
        },
      },
    };

    const input = {
      polyProp: { hello: 'world' },
    };

    const diffs = [...diffBodyBySchema({ value: input }, jsonSchema)];

    const patches = diffs.flatMap((diff) => [
      ...generateShapePatchesByDiff(diff, jsonSchema, {}, '3.1.x'),
    ]);

    expect(patches).toMatchSnapshot();
  });

  it('when root schema is obejct and is shown an array', () => {
    const jsonSchema: SchemaObject = {
      type: 'object',
      properties: {
        sup: { type: 'string' },
      },
    };

    const input: any = [];

    const diffs = [...diffBodyBySchema({ value: input }, jsonSchema)];

    const patches = diffs.flatMap((diff) => [
      ...generateShapePatchesByDiff(diff, jsonSchema, {}, '3.1.x'),
    ]);

    expect(patches).toMatchSnapshot();
  });

  it('can add an additional branch to a complex one of', () => {
    const jsonSchema: SchemaObject = objectOrStringOneOf();

    const input: any = {
      location: {
        principality: {
          city: 'San Fransisco',
          population: 830000,
          coordinates: [1, 2, 3],
        },
      },
    };

    const diffs = [...diffBodyBySchema({ value: input }, jsonSchema)];

    const patches = diffs.flatMap((diff) => [
      ...generateShapePatchesByDiff(diff, jsonSchema, {}, '3.1.x'),
    ]);

    expect(patches).toMatchSnapshot();
  });
});
