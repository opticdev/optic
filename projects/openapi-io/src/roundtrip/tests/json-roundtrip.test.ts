import { jsonPatchFixture, yamlPatchFixture } from './fixture';
import { JsonRoundtripper } from '../write-surgical/json';
import path from 'path';
import fs from 'fs-extra';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { PatchApplyResult } from '../roundtrip-provider';

function cleanSnapshot(input: PatchApplyResult) {
  if (input.filePath) {
    input.filePath = path.parse(input.filePath).name;
  }
  return input;
}

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
    expect(cleanSnapshot(result)).toMatchSnapshot();
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
      expect(cleanSnapshot(result)).toMatchSnapshot();
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
      expect(cleanSnapshot(result)).toMatchSnapshot();
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
      expect(cleanSnapshot(result)).toMatchSnapshot();
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
      expect(cleanSnapshot(result)).toMatchSnapshot();
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
      expect(cleanSnapshot(result)).toMatchSnapshot();
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
      expect(cleanSnapshot(result)).toMatchSnapshot();
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
      expect(cleanSnapshot(result)).toMatchSnapshot();
    });

    it('can remove first item in array', async () => {
      const result = await yamlPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['required', '0']),
          },
        ],
        JsonRoundtripper
      );
      expect(cleanSnapshot(result)).toMatchSnapshot();
    });

    it('can remove middle item in array', async () => {
      const result = await yamlPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['required', '2']),
          },
        ],
        JsonRoundtripper
      );
      expect(cleanSnapshot(result)).toMatchSnapshot();
    });

    it('can remove last item in array', async () => {
      const result = await yamlPatchFixture(
        'simple-json-schema-example.json',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['required', '4']),
          },
        ],
        JsonRoundtripper
      );
      expect(cleanSnapshot(result)).toMatchSnapshot();
    });

    it('can remove only item in array', async () => {
      const result = await yamlPatchFixture(
        'small-arrays.json',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['withOneItem', '0']),
          },
        ],
        JsonRoundtripper
      );
      expect(cleanSnapshot(result)).toMatchSnapshot();
    });
  });

  describe('patch object scenarios', () => {
    it('appending a field to a multi line object with existing children', async () => {
      expect(
        cleanSnapshot(
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
      expect(cleanSnapshot(meta)).toMatchSnapshot();
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

      expect(cleanSnapshot(meta)).toMatchSnapshot();
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

      expect(cleanSnapshot(patch)).toMatchSnapshot();
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
      expect(cleanSnapshot(patch)).toMatchSnapshot();
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
      expect(cleanSnapshot(patch)).toMatchSnapshot();
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
      expect(cleanSnapshot(patch)).toMatchSnapshot();
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
      expect(cleanSnapshot(meta)).toMatchSnapshot();
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
      expect(cleanSnapshot(meta)).toMatchSnapshot();
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
      expect(cleanSnapshot(meta)).toMatchSnapshot();
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
      expect(cleanSnapshot(meta)).toMatchSnapshot();
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
      expect(cleanSnapshot(meta)).toMatchSnapshot();
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
      expect(cleanSnapshot(meta)).toMatchSnapshot();
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
