import { opticJsonSchemaDiffer } from '../index';
import {
  extendSchemaWithExample,
  streamingJsonSchemaBuilder,
} from './streaming-json-schema-builder';
import { locations } from '../plugins/tests/json-schema-diff-patch-fixture';
const schemaDiffer = opticJsonSchemaDiffer();

function fixture(input: any, ...additional: any[]) {
  const jsonSchemaForInput = streamingJsonSchemaBuilder(
    schemaDiffer,
    input,
    ...additional
  );

  const diffBetweenGeneratedAndInput = schemaDiffer.compare(
    jsonSchemaForInput,
    input,
    locations.inAResponse,
    '',
    { collapseToFirstInstanceOfArrayDiffs: true }
  );
  return {
    input,
    jsonSchemaForInput,
    diffBetweenGeneratedAndInput,
  };
}

describe('json builder', () => {
  describe('primitives', () => {
    it('can build JSON from a string', async () => {
      const result = fixture('string value');
      expect(result.diffBetweenGeneratedAndInput).toHaveLength(0);
      expect(result).toMatchSnapshot();
    });
    it('can build JSON from a boolean', async () => {
      const result = fixture(true);
      expect(result.diffBetweenGeneratedAndInput).toHaveLength(0);
      expect(result).toMatchSnapshot();
    });
    it('can build JSON from a number', async () => {
      const result = fixture(1544);
      expect(result.diffBetweenGeneratedAndInput).toHaveLength(0);
      expect(result).toMatchSnapshot();
    });

    it('can build JSON from a null', async () => {
      const result = fixture(null);
      expect(result.diffBetweenGeneratedAndInput).toHaveLength(0);
      expect(result).toMatchSnapshot();
    });
  });
  describe('objects', () => {
    it('can learn an object with primitive fields', () => {
      const result = fixture({
        hello: 'world',
        age: 145,
      });
      expect(result.diffBetweenGeneratedAndInput).toHaveLength(0);
      expect(result).toMatchSnapshot();
    });
    it('can learn nested objects', () => {
      const result = fixture({
        hello: 'world',
        age: 145,
        nested: {
          nested2: {
            nested3: {
              stringField: 'abc',
            },
          },
        },
      });
      expect(result.diffBetweenGeneratedAndInput).toHaveLength(0);
      expect(result).toMatchSnapshot();
    });

    it('can learn that an object with primitive fields is polymorphic', () => {
      const result = fixture(
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
        }
      );
      expect(result.diffBetweenGeneratedAndInput).toHaveLength(0);
      expect(result).toMatchSnapshot();
    });
  });
  describe('arrays', () => {
    it('can learn an array of object items', () => {
      const result = fixture([{ field: 1 }, { field: 2 }, { field: 3 }]);
      expect(result.diffBetweenGeneratedAndInput).toHaveLength(0);
      expect(result).toMatchSnapshot();
    });
    it('can learn an array of object items with polymorphism', () => {
      const result = fixture([
        { field: 1 },
        { field: 2 },
        { field: 3, field2: '' },
      ]);
      expect(result.diffBetweenGeneratedAndInput).toHaveLength(0);
      expect(result).toMatchSnapshot();
    });
    it('can learn an array of primitive items', () => {
      const result = fixture(['a', 'b', 'c']);
      expect(result.diffBetweenGeneratedAndInput).toHaveLength(0);
      expect(result).toMatchSnapshot();
    });

    it('[known limitation] -- empty arrays will never learn their types, must be set by user', () => {
      // new keyword would be needed to emit a diff of kind "UnderspecifiedArrayObservation"
      const result = fixture([], ['hello']);
      expect(result.diffBetweenGeneratedAndInput).toHaveLength(0);
      expect(result).toMatchSnapshot();
    });

    it('can learn an array with polymorphism, that can also be an object', () => {
      const arraysWithWildPolymorphism = [
        [{ food: 'rice' }, { food: 'cookies' }, { food: 'chips' }],
        ['user1', 'user2', 'user3'],
        ['user1', 'user2', 'user3'],
        ['user1', 'user2', 'user3'],
        ['user1', 'user2', 'user3'],
        { nemesis: 'Brad' },
      ];

      const result = fixture(
        arraysWithWildPolymorphism[0],
        ...arraysWithWildPolymorphism
      );
      expect(result.diffBetweenGeneratedAndInput).toHaveLength(0);
      expect(result).toMatchSnapshot();
    });

    it('can learn an object, that can also be an array with polymorphism', () => {
      const arraysWithWildPolymorphism = [
        { nemesis: 'Brad' },
        [{ food: 'rice' }, { food: 'cookies' }, { food: 'chips' }],
        // ['user1', 'user2', 'user3'],
      ];

      const result = fixture(
        arraysWithWildPolymorphism[0],
        ...arraysWithWildPolymorphism
      );
      expect(result.diffBetweenGeneratedAndInput).toHaveLength(0);
      expect(result).toMatchSnapshot();
    });

    it('can extend an object array one of properly', () => {
      const schema: any = {
        oneOf: [
          {
            type: 'object',
            properties: {
              nemesis: {
                type: 'string',
              },
            },
            required: ['nemesis'],
          },
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                food: {
                  type: 'string',
                },
              },
              required: ['food'],
            },
          },
        ],
      };

      const result = extendSchemaWithExample(opticJsonSchemaDiffer(), schema, [
        'user1',
        'user2',
        'user3',
      ]);

      console.log(result.schema);
      expect(result).toMatchSnapshot();
    });
  });
});
