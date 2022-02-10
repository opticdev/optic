import {
  jsonSchemaDiffPatchFixture,
  locations,
} from './json-schema-diff-patch-fixture';
import { jsonSchemaDiffer } from '../../index';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { typeKeyword } from '../type';
import { additionalProperties } from '../additionalProperties';

const onlyRequiredRules = jsonSchemaDiffer([typeKeyword, additionalProperties]);

describe('type json schema differ plugin', () => {
  const jsonSchema: OpenAPIV3.SchemaObject = {
    type: 'object',
    properties: {
      stringField: { type: 'string' },
    },
  };

  it('when valid, no diff', () => {
    const input = {
      stringField: 'hello-string',
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

  it('when optional and not provided, no type diff', () => {
    const input = {
      // stringField: "hello-string", // commented to show ommitted
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

  it('when provided with another primitive, it can apply patches', () => {
    const input = {
      stringField: 123,
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

  it('when provided with an array, it can apply patches', () => {
    const input = {
      stringField: ['1', '2', '3', true],
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

  it('when provided with an object, it can apply patches', () => {
    const input = {
      stringField: { field: 'string' },
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

  it('when provided with null value, it can apply patches', () => {
    const input: any = {
      stringField: null,
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
});
