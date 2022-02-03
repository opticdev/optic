import { yamlPatchFixture } from './fixture';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { YamlRoundtripper } from '../write-surgical/yaml';

describe('yaml roundtrip', () => {
  it('can apply json patches', async () => {
    const result = await yamlPatchFixture(
      'simple-json-schema-example.yaml',
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
      YamlRoundtripper
    );
    expect(result).toMatchSnapshot();
  });

  describe('patch field array scenarios', () => {
    it(`can append a string to a multiline array`, async () => {
      const result = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['required', '-']),
            value: 'address',
          },
        ],
        YamlRoundtripper
      );
      expect(result).toMatchSnapshot();
    });

    it('can prepend a string to a multiline array', async () => {
      const result = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['required', '0']),
            value: 'address',
          },
        ],
        YamlRoundtripper
      );
      expect(result).toMatchSnapshot();
    });

    it('can add a string to the middle of an array', async () => {
      const result = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['required', '2']),
            value: 'address',
          },
        ],
        YamlRoundtripper
      );
      expect(result).toMatchSnapshot();
    });

    it('can append an object to a multi line array', async () => {
      const result = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
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
        YamlRoundtripper
      );
      expect(result).toMatchSnapshot();
    });
    it('can add an object to the middle of a  multi line array', async () => {
      const result = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['required', '2']),
            value: {
              hello: 'world',
              colors: ['red', 'green', 'blue'],
            },
          },
        ],
        YamlRoundtripper
      );
      expect(result).toMatchSnapshot();
    });

    it('empty single line array, expands', async () => {
      const result = await yamlPatchFixture(
        'small-arrays.yaml',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['empty', '-']),
            value: 'EXAMPLE',
          },
        ],
        YamlRoundtripper
      );
      expect(result).toMatchSnapshot();
    });
    it('empty multi line array, can be appended to', async () => {
      const result = await yamlPatchFixture(
        'small-arrays.yaml',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['empty-multi-line', '-']),
            value: 'EXAMPLE',
          },
        ],
        YamlRoundtripper
      );
      expect(result).toMatchSnapshot();
    });
    it('string single line array, is expanded', async () => {
      const result = await yamlPatchFixture(
        'small-arrays.yaml',
        [
          {
            op: 'add',
            path: jsonPointerHelpers.compile(['colors', '1']),
            value: 'purple',
          },
        ],
        YamlRoundtripper
      );
      expect(result).toMatchSnapshot();
    });

    it('can remove first item in array', async () => {
      const result = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['required', '0']),
          },
        ],
        YamlRoundtripper
      );
      expect(result).toMatchSnapshot();
    });

    it('can remove middle item in array', async () => {
      const result = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['required', '2']),
          },
        ],
        YamlRoundtripper
      );
      expect(result).toMatchSnapshot();
    });

    it('can remove last item in array', async () => {
      const result = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['required', '4']),
          },
        ],
        YamlRoundtripper
      );
      expect(result).toMatchSnapshot();
    });

    it('can remove only item in array', async () => {
      const result = await yamlPatchFixture(
        'small-arrays.yaml',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['withOneItem', '0']),
          },
        ],
        YamlRoundtripper
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('patch object scenarios', () => {
    it('appending a field to a multi line object with existing children', async () => {
      const result = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
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
        YamlRoundtripper
      );

      expect(result).toMatchSnapshot();
    });

    it('appending a field to an empty object single-line', async () => {
      const meta = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
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
        YamlRoundtripper
      );

      expect(meta).toMatchSnapshot();
    });

    it('removing first field in an object', async () => {
      const patch = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['properties', 'name']),
          },
        ],
        YamlRoundtripper
      );

      expect(patch).toMatchSnapshot();
    });

    it('removing middle field in an object', async () => {
      const patch = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['properties', 'artist']),
          },
        ],
        YamlRoundtripper
      );
      expect(patch).toMatchSnapshot();
    });

    it('removing last field in an object', async () => {
      const patch = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'remove',
            path: jsonPointerHelpers.compile(['properties', 'tags']),
          },
        ],
        YamlRoundtripper
      );
      expect(patch).toMatchSnapshot();
    });

    it('removing only field in an object', async () => {
      const patch = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
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
        YamlRoundtripper
      );
      expect(patch).toMatchSnapshot();
    });
  });

  describe('replace patch', () => {
    it('can replace an object with a primitive', async () => {
      const meta = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'replace',
            path: jsonPointerHelpers.compile(['properties']),
            value: 12345,
          },
        ],
        YamlRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });

    it('can replace an object an empty array', async () => {
      const meta = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'replace',
            path: jsonPointerHelpers.compile(['properties']),
            value: [],
          },
        ],
        YamlRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });

    it('can replace a string with an object', async () => {
      const meta = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'replace',
            path: jsonPointerHelpers.compile(['title']),
            value: { anything: 'else' },
          },
        ],
        YamlRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });

    it('can replace an object with another object', async () => {
      const meta = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'replace',
            path: jsonPointerHelpers.compile(['properties']),
            value: { hello: 'world', a: ['2', 3] },
          },
        ],
        YamlRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });

    it('can replace a mapping value with a null', async () => {
      const meta = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'replace',
            path: jsonPointerHelpers.compile(['properties']),
            value: null,
          },
        ],
        YamlRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });

    it('can replace a mapping value with a primitive', async () => {
      const meta = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'replace',
            path: jsonPointerHelpers.compile(['properties']),
            value: true,
          },
        ],
        YamlRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });

    it('can replace an array item', async () => {
      const meta = await yamlPatchFixture(
        'simple-json-schema-example.yaml',
        [
          {
            op: 'replace',
            path: jsonPointerHelpers.compile(['required', '1']),
            value: { hello: 'world', color: [1, 2, 3] },
          },
        ],
        YamlRoundtripper
      );
      expect(meta).toMatchSnapshot();
    });
  });
});
