import {
  jsonSchemaDiffPatchFixture,
  locations,
} from './json-schema-diff-patch-fixture';
import { jsonSchemaDiffer } from '../../index';
import { requiredKeyword } from '../required';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

const onlyRequiredRules = jsonSchemaDiffer([requiredKeyword]);

describe('required json schema differ plugin', () => {
  const jsonSchema: OpenAPIV3.SchemaObject = {
    type: 'object',
    properties: {
      hello: {
        type: 'object',
        required: ['f1', 'f2', 'f3'],
        properties: {
          f1: { type: 'string' },
          f2: { type: 'number' },
          f3: { type: 'object' },
        },
      },
    },
  };

  it("missing required fields will patch as 'make optional' or 'remove'", () => {
    const input = {
      hello: { f1: 'value', f2: 122 },
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
