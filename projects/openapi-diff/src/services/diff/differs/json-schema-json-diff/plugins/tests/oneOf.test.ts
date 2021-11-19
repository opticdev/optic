import {
  jsonSchemaDiffPatchFixture,
  locations,
} from './json-schema-diff-patch-fixture';
import { jsonSchemaDiffer } from '../../index';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { typeKeyword } from '../type';
import { additionalProperties } from '../additionalProperties';
import { oneOfKeyword } from '../oneOf';

const onlyRequiredRules = jsonSchemaDiffer([
  oneOfKeyword,
  typeKeyword,
  additionalProperties,
]);

describe('one of json schema differ plugin', () => {
  const jsonSchema: OpenAPIV3.SchemaObject = {
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
    const diffs = onlyRequiredRules.compare(
      jsonSchema,
      input,
      locations.inAResponse,
      '',
      { collapseToFirstInstanceOfArrayDiffs: true }
    );
    expect(diffs).toHaveLength(0);
  });
  it('when valid case 2, no diff', () => {
    const input = {
      polyProp: 123,
    };
    const diffs = onlyRequiredRules.compare(
      jsonSchema,
      input,
      locations.inAResponse,
      '',
      { collapseToFirstInstanceOfArrayDiffs: true }
    );
    expect(diffs).toHaveLength(0);
  });

  it('when new primitive types provided to existing one of ', () => {
    const input = {
      polyProp: true,
    };

    const result = jsonSchemaDiffPatchFixture(
      onlyRequiredRules,
      jsonSchema,
      input,
      locations.inAResponse
    );

    expect(result.totalDiffsAfterPatches).toBe(0);
    expect(result).toMatchSnapshot();
  });

  it('when new field in one of object variant of one of', () => {
    const jsonSchema: OpenAPIV3.SchemaObject = {
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

    const result = jsonSchemaDiffPatchFixture(
      onlyRequiredRules,
      jsonSchema,
      input,
      locations.inAResponse
    );

    expect(result.totalDiffsAfterPatches).toBe(0);
    expect(result).toMatchSnapshot();
  });

  it('when root schema is obejct and is shown an array', () => {
    const jsonSchema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: {
        sup: { type: 'string' },
      },
    };

    const input: any = [];

    const result = jsonSchemaDiffPatchFixture(
      onlyRequiredRules,
      jsonSchema,
      input,
      locations.inAResponse
    );

    expect(result.totalDiffsAfterPatches).toBe(0);
    expect(result).toMatchSnapshot();
  });
});
