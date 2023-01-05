import { test, expect, describe } from '@jest/globals';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { TestHelpers } from '@useoptic/rulesets-base';
import { BreakingChangesRuleset } from '../index';

describe('breaking changes ruleset - parameter enum change', () => {
  test.each(['query', 'cookie', 'path', 'header'])(
    'enum added to %p parameter',
    async (location: string) => {
      const beforeJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'test',
                  in: location,
                  schema: {
                    type: 'string',
                  },
                },
              ],
              responses: {},
            },
          },
        },
      };
      const afterJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'test',
                  in: location,
                  schema: {
                    type: 'string',
                    enum: ['a', 'b'], // a new enum is added
                  },
                },
              ],
              responses: {},
            },
          },
        },
      };
      const results = await TestHelpers.runRulesWithInputs(
        [new BreakingChangesRuleset()],
        beforeJson,
        afterJson
      );
      expect(results.length > 0).toBe(true);

      expect(results).toMatchSnapshot();
      expect(results.some((result) => !result.passed)).toBe(true);
    }
  );

  test.each(['query', 'cookie', 'path', 'header'])(
    '%p parameter enum narrowing',
    async (location: string) => {
      const beforeJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'test',
                  in: location,
                  schema: {
                    type: 'string',
                    enum: ['a', 'b'],
                  },
                },
              ],
              responses: {},
            },
          },
        },
      };
      const afterJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'test',
                  in: location,
                  schema: {
                    type: 'string',
                    enum: ['b'], // enum values are restricted
                  },
                },
              ],
              responses: {},
            },
          },
        },
      };
      const results = await TestHelpers.runRulesWithInputs(
        [new BreakingChangesRuleset()],
        beforeJson,
        afterJson
      );
      expect(results.length > 0).toBe(true);

      expect(results).toMatchSnapshot();
      expect(results.some((result) => !result.passed)).toBe(true);
    }
  );
});
