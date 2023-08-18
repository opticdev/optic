import { it, describe, expect } from '@jest/globals';
import * as DocumentedBodyFixtures from '../fixtures/documented-body';
import { rootObjectOrArray } from '../fixtures/oneof-schemas';
import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';
import {
  Schema,
  SchemaObject,
} from '../../../capture/patches/patchers/shapes/schema';
import { ShapePatches } from '../../../capture/patches/patchers/shapes/patches';
import { diffBodyBySchema } from '../../../capture/patches/patchers/shapes/diff';

function generateSchema(
  openAPIVersion: SupportedOpenAPIVersions,
  ...inputs: any[]
): SchemaObject | null {
  return patchSchema(null, openAPIVersion, ...inputs);
}

function patchSchema(
  schema: SchemaObject | null,
  openAPIVersion: SupportedOpenAPIVersions,
  ...inputs: any[]
): SchemaObject | null {
  for (let input of inputs) {
    let body = DocumentedBodyFixtures.jsonBody(input);
    body.schema = schema;
    let patches = ShapePatches.generateBodyAdditions(body, openAPIVersion);

    for (let patch of patches) {
      if ('unpatchable' in patch) continue;

      schema = Schema.applyShapePatch(schema, patch);
    }
  }

  return schema;
}

function* diffs(schema: SchemaObject | null, ...inputs: any[]) {
  if (!schema) return;
  for (let input of inputs) {
    yield* diffBodyBySchema({ value: input }, schema, {
      specJsonPath: '',
      interaction: {} as any,
    });
  }
}

describe('generate shapes from bodies', () => {
  describe('primitives', () => {
    it('can build JSON from a string', async () => {
      const input = 'string value';
      const result = generateSchema('3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });
    it('can build JSON from a boolean', async () => {
      const input = true;
      const result = generateSchema('3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });
    it('can build JSON from a number', async () => {
      const input = 1544;
      const result = generateSchema('3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });

    it('can build JSON from a null', async () => {
      const input = null;
      const result = generateSchema('3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });

    it('can become type null in 3.1', async () => {
      const input = null;
      const result = patchSchema({ type: 'string' }, '3.1.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });

    it('can become type null in 3.0', async () => {
      const input = null;
      const result = patchSchema({ type: 'string' }, '3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });
  });

  describe('objects', () => {
    it('can learn an object with primitive fields', () => {
      const input = {
        hello: 'world',
        age: 145,
      };
      const result = generateSchema('3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });
    it('can learn nested objects', () => {
      const input = {
        hello: 'world',
        age: 145,
        nested: {
          nested2: {
            nested3: {
              stringField: 'abc',
            },
          },
        },
      };
      const result = generateSchema('3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });

    it('can learn that an object with primitive fields is polymorphic', () => {
      const inputs = [
        {
          hello: 'world',
          age: 145,
        },
        {
          // hello: "world", // commented to show it is missing
          age: 145,
        },
        {
          // hello: "world",
          age: 145,
          admin: true,
        },
        // the repeats stress the system and make sure the bail from infinite loop logic works
        {
          // hello: "world",
          age: 145,
          admin: true,
        },
        {
          // hello: "world",
          age: 145,
          admin: true,
        },
        {
          // hello: "world",
          age: 145,
        },
      ];

      const result = generateSchema('3.0.x', ...inputs);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, ...inputs)]).toHaveLength(0);
    });
  });
  describe('arrays', () => {
    it('can learn an array of object items', () => {
      const input = [{ field: 1 }, { field: 2 }, { field: 3 }];

      const result = generateSchema('3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });
    it('can learn an array of object items with polymorphism', () => {
      const input = [{ field: 1 }, { field: 2 }, { field: 3, field2: '' }];

      const result = generateSchema('3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });
    it('can learn an array of primitive items', () => {
      const input = ['a', 'b', 'c'];
      const result = generateSchema('3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });

    it('[known limitation] -- empty arrays will never learn their types, must be set by user', () => {
      // new keyword would be needed to emit a diff of kind "UnderspecifiedArrayObservation"
      const inputs = [[], ['hello']];
      const result = generateSchema('3.0.x', ...inputs);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, ...inputs)]).toHaveLength(0);
    });

    it('can learn an array with polymorphism, that can also be an object', () => {
      const inputs = [
        [{ food: 'rice' }, { food: 'cookies' }, { food: 'chips' }],
        ['user1', 'user2', 'user3'],
        ['user1', 'user2', 'user3'],
        ['user1', 'user2', 'user3'],
        ['user1', 'user2', 'user3'],
        { nemesis: 'Brad' },
      ];

      const result = generateSchema('3.0.x', ...inputs);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, ...inputs)]).toHaveLength(0);
    });

    it('can learn an object, that can also be an array with polymorphism', () => {
      const inputs = [
        { nemesis: 'Brad' },
        [{ food: 'rice' }, { food: 'cookies' }, { food: 'chips' }],
        // ['user1', 'user2', 'user3'],
      ];

      const result = generateSchema('3.0.x', ...inputs);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, ...inputs)]).toHaveLength(0);
    });
  });

  describe('oneOfs are built correctly', () => {
    it('one of array or object', () => {
      const input = ['user1', 'user2', 'user3'];

      const result = patchSchema(rootObjectOrArray(), '3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });

    it('can learn an array of objects', () => {
      const input = {
        name: { first: 'Bob', last: 'C' },
        rivals: [{ food: 'rice' }, { food: 'cookies' }, { food: 'chips' }],
        stats: { rank: 1 },
      };

      const result = generateSchema('3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });

    it('can learn an array of objects with polymorphism', () => {
      const input = {
        name: { first: 'Bob', last: 'C' },
        rivals: [
          { food: 'rice' },
          { food: 'cookies' },
          { food: 'chips' },
          'none',
        ],
        stats: { rank: 1 },
      };

      const result = generateSchema('3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });

    it('can learn an array of objects with polymorphism when primitive value seen first', () => {
      const input = {
        name: { first: 'Bob', last: 'C' },
        rivals: ['none', { hello: 'world' }],
        stats: { rank: 1 },
      };

      const result = generateSchema('3.0.x', input);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, input)]).toHaveLength(0);
    });

    it('can polymorphism between instances of objects and arrays', () => {
      const inputs = [
        {
          location: {
            principality: {
              city: 'San Fransisco',
              population: 830000,
              coordinates: [1, 2, 3],
            },
          },
        },
        {
          location: {
            principality: {
              city: 'San Fransisco',
              population: 830000,
              coordinates: {
                format: 'DMS',
                lat: '37.7749° N',
                long: '122.4194° W',
              },
            },
          },
        },
      ];

      const result = generateSchema('3.0.x', ...inputs);
      expect(result).toMatchSnapshot();
      expect([...diffs(result, ...inputs)]).toHaveLength(0);
    });
  });
});
