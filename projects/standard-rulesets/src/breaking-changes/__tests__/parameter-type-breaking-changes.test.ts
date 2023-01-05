import { test, expect, describe } from '@jest/globals';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { TestHelpers } from '@useoptic/rulesets-base';
import { BreakingChangesRuleset } from '../index';

describe('breaking changes ruleset - parameter type change', () => {
  test.each(['query', 'cookie', 'path', 'header'])(
    '%p parameter type change',
    async (location: string) => {
      const beforeJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'version',
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
                  name: 'version',
                  in: location,
                  schema: {
                    type: 'number',
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
