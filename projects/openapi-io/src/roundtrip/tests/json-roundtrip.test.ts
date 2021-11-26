import { jsonPatchFixture } from './fixture';
import { JsonRoundtripper } from '../json';
import path from 'path';
import fs from 'fs-extra';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

describe('json roundtrip', () => {
  it('can apply json patches', async () => {
    const result = await jsonPatchFixture(
      'simple-json-schema-example.json',
      [
        {
          op: 'add',
          path: jsonPointerHelpers.compile(['properties', 'address']),
          value: {
            type: 'object',
            description: 'where we live',
            required: ['zipCode', 'street'],
            properties: {
              zipCode: { type: 'number' },
              street: { type: 'string' },
            },
          },
        },
        {
          op: 'add',
          path: jsonPointerHelpers.compile(['required', '-']),
          value: 'address',
        },
      ],
      JsonRoundtripper
    );
    expect(result).toMatchSnapshot();
  });

  describe('patch field array scenarios', () => {
    it('can append a string to a multiline array', async () => {
      const result = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['required', '-']),
            value: 'address',
          },
        ],
        JsonRoundtripper
      );
      expect(result).toMatchSnapshot();
    });

    it('can prepend a string to a multiline array', async () => {
      const result = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['required', '0']),
            value: 'address',
          },
        ],
        JsonRoundtripper
      );
      expect(result).toMatchSnapshot();
    });

    it('can add a string to the middle of an array', async () => {
      const result = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['required', '2']),
            value: 'address',
          },
        ],
        JsonRoundtripper
      );
      expect(result).toMatchSnapshot();
    });

    it('can append an object to a multi line array', async () => {
      const result = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['required', '-']),
            value: {
              hello: 'world',
              colors: ['red', 'green', 'blue'],
            },
          },
        ],
        JsonRoundtripper
      );
      expect(result).toMatchSnapshot();
    });

    it('empty single line array, expands', async () => {
      const result = await jsonPatchFixture(
        'small-arrays.json',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['empty', '-']),
            value: 'EXAMPLE',
          },
        ],
        JsonRoundtripper
      );
      expect(result).toMatchSnapshot();
    });
    it('empty multi line array, can be appended to', async () => {
      const result = await jsonPatchFixture(
        'small-arrays.json',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['empty-multi-line', '-']),
            value: 'EXAMPLE',
          },
        ],
        JsonRoundtripper
      );
      expect(result).toMatchSnapshot();
    });
    it('string single line array, is expanded', async () => {
      const result = await jsonPatchFixture(
        'small-arrays.json',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['colors', '1']),
            value: 'purple',
          },
        ],
        JsonRoundtripper
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('patch object scenarios', () => {
    it('appending a field to a multi line object with existing children', async () => {
      expect(
        await jsonPatchFixture(
          'simple-json-schema-example.json',
          [
            {
              op: 'add',
              path: jsonPointerHelpers.compile(['properties', 'address']),
              value: {
                type: 'object',
                description: 'where we live',
                required: ['zipCode', 'street'],
                properties: {
                  zipCode: { type: 'number' },
                  street: { type: 'string' },
                },
              },
            },
          ],
          JsonRoundtripper
        )
      ).toMatchSnapshot();
    });
    it('appending a field to an empty object multi-line', async () => {
      const meta = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['meta', 'address']),
            value: {
              type: 'object',
              description: 'where we live',
              required: ['zipCode', 'street'],
              properties: {
                zipCode: { type: 'number' },
                street: { type: 'string' },
              },
            },
          },
        ],
        JsonRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });

    it('appending a field to an empty object single-line', async () => {
      const meta = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['meta-single', 'address']),
            value: {
              type: 'object',
              description: 'where we live',
              required: ['zipCode', 'street'],
              properties: {
                zipCode: { type: 'number' },
                street: { type: 'string' },
              },
            },
          },
        ],
        JsonRoundtripper
      );

      expect(meta).toMatchSnapshot();
    });

    it('removing first field in an object', async () => {
      const patch = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['properties', 'name']),
          },
        ],
        JsonRoundtripper
      );

      expect(patch).toMatchSnapshot();
    });

    it('removing middle field in an object', async () => {
      const patch = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['properties', 'artist']),
          },
        ],
        JsonRoundtripper
      );
      expect(patch).toMatchSnapshot();
    });

    it('removing last field in an object', async () => {
      const patch = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['properties', 'tags']),
          },
        ],
        JsonRoundtripper
      );
      expect(patch).toMatchSnapshot();
    });

    it('removing only field in an object', async () => {
      const patch = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile([
              'properties',
              'dimension',
              '$ref',
            ]),
          },
        ],
        JsonRoundtripper
      );
      expect(patch).toMatchSnapshot();
    });
  });

  describe('replace patch', () => {
    it('can replace an object with a primitive', async () => {
      const meta = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'replace',
            path: jsonPointerHelpers.compile(['properties']),
            value: 12345,
          },
        ],
        JsonRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });

    it('can replace a string with an object', async () => {
      const meta = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'replace',
            path: jsonPointerHelpers.compile(['title']),
            value: { anything: 'else' },
          },
        ],
        JsonRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });

    it('can replace an object with another object', async () => {
      const meta = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'replace',
            path: jsonPointerHelpers.compile(['properties']),
            value: { hello: 'world', a: ['2', 3] },
          },
        ],
        JsonRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });

    it('can replace a mapping value with a null', async () => {
      const meta = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'replace',
            path: jsonPointerHelpers.compile(['properties']),
            value: null,
          },
        ],
        JsonRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });

    it('can replace a mapping value with a primitive', async () => {
      const meta = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'replace',
            path: jsonPointerHelpers.compile(['properties']),
            value: true,
          },
        ],
        JsonRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });

    it('can replace an array item', async () => {
      const meta = await jsonPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'replace',
            path: jsonPointerHelpers.compile(['required', '1']),
            value: { hello: 'world', color: [1, 2, 3] },
          },
        ],
        JsonRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });
  });

  describe('can infer style', () => {
    it('infers tabs', async () => {
      const fileContents = (
        await fs.readFile(
          path.resolve(path.join(__dirname, 'inputs', 'tab.json.not'))
        )
      ).toString();
      expect(
        await JsonRoundtripper.inferConfig(fileContents)
      ).toMatchSnapshot();
    });

    it('infers spaces', async () => {
      const fileContents = (
        await fs.readFile(
          path.resolve(path.join(__dirname, 'inputs', 'space.json.not'))
        )
      ).toString();
      expect(
        await JsonRoundtripper.inferConfig(fileContents)
      ).toMatchSnapshot();
    });
  });
});
