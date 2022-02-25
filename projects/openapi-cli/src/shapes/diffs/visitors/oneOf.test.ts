import { diffValueBySchema } from '..';
import { objectOrStringOneOf } from '../../../tests/fixtures/oneof-schemas';
import { SchemaObject } from '../../schema';

describe('one of json schema diff visitor', () => {
  const jsonSchema: SchemaObject = {
    type: 'object',
    properties: {
      polyProp: {
        oneOf: [{ type: 'string' }, { type: 'number' }],
      },
    },
  };

  it('when valid, no diff', () => {
    const input = {
      polyProp: 'hello-string',
    };
    const diffs = diffValueBySchema(input, jsonSchema);
    expect([...diffs]).toHaveLength(0);
  });
  it('when valid case 2, no diff', () => {
    const input = {
      polyProp: 123,
    };
    const diffs = diffValueBySchema(input, jsonSchema);
    expect([...diffs]).toHaveLength(0);
  });

  it('when new primitive types provided to existing one of ', () => {
    const input = {
      polyProp: true,
    };

    const diffs = diffValueBySchema(input, jsonSchema);

    // expect(result.totalDiffsAfterPatches).toBe(0);
    expect([...diffs]).toMatchSnapshot();
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

    const diffs = diffValueBySchema(input, jsonSchema);

    expect([...diffs]).toMatchSnapshot();
  });

  it('when root schema is obejct and is shown an array', () => {
    const jsonSchema: SchemaObject = {
      type: 'object',
      properties: {
        sup: { type: 'string' },
      },
    };

    const input: any = [];

    const diffs = diffValueBySchema(input, jsonSchema);
    expect([...diffs]).toMatchSnapshot();
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

    const diffs = diffValueBySchema(input, jsonSchema);
    expect([...diffs]).toMatchSnapshot();
  });
});
