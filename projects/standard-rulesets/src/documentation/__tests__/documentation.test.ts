import { test, expect, describe, beforeEach } from '@jest/globals';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { TestHelpers } from '@useoptic/rulesets-base';
import { DocumentationRuleset } from '../index';

describe('documentation ruleset', () => {
  describe.each([['passing'], ['failing']])('%s', (test_type) => {
    const shouldPass = test_type === 'passing';
    let input: any;
    beforeEach(() => {
      input = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              responses: {
                '200': {
                  description: 'ok',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {},
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
    });

    test('require operation description', async () => {
      if (shouldPass) {
        input.paths['/api/users'].get.description = 'this is a description';
      }

      const results = await TestHelpers.runRulesWithInputs(
        [
          new DocumentationRuleset({
            required_on: 'always',
            require_operation_description: true,
          }),
        ],
        input,
        input
      );
      expect(results.length > 0).toBe(true);

      expect(results).toMatchSnapshot();
      expect(results.every((result) => result.passed)).toBe(shouldPass);
    });

    test('require operation id', async () => {
      if (shouldPass) {
        input.paths['/api/users'].get.operationId = 'operationid';
      }

      const results = await TestHelpers.runRulesWithInputs(
        [
          new DocumentationRuleset({
            required_on: 'always',
            require_operation_id: true,
          }),
        ],
        input,
        input
      );
      expect(results.length > 0).toBe(true);

      expect(results).toMatchSnapshot();
      expect(results.every((result) => result.passed)).toBe(shouldPass);
    });

    test('require operation summary', async () => {
      if (shouldPass) {
        input.paths['/api/users'].get.summary = 'this is a summary';
      }

      const results = await TestHelpers.runRulesWithInputs(
        [
          new DocumentationRuleset({
            required_on: 'always',
            require_operation_summary: true,
          }),
        ],
        input,
        input
      );
      expect(results.length > 0).toBe(true);

      expect(results).toMatchSnapshot();
      expect(results.every((result) => result.passed)).toBe(shouldPass);
    });

    test('require property description', async () => {
      input.paths['/api/users'].get.responses['200'].content[
        'application/json'
      ].schema.properties = {
        id: {
          type: 'string',
          description: shouldPass ? 'description' : undefined,
        },
      };

      const results = await TestHelpers.runRulesWithInputs(
        [
          new DocumentationRuleset({
            required_on: 'always',
            require_property_descriptions: true,
          }),
        ],
        input,
        input
      );
      expect(results.length > 0).toBe(true);

      expect(results).toMatchSnapshot();
      expect(results.every((result) => result.passed)).toBe(shouldPass);
    });
  });
});
