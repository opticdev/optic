import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { TestHelpers } from '@useoptic/rulesets-base';
import { BreakingChangesRuleset } from '../index';

describe('enum breaking changes ruleset', () => {
  test.each(['query', 'cookie', 'path', 'header'])(
    'enum added to %p parameter',
    (location: string) => {
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
      const results = TestHelpers.runRulesWithInputs(
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
    (location: string) => {
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
      const results = TestHelpers.runRulesWithInputs(
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
