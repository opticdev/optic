import { defaultEmptySpec, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { RuleRunner } from '../rule-runner';
import { OperationRule, Ruleset } from '../rules';
import { createRuleInputs } from '../test-helpers';

describe('ruleset', () => {
  test('matches rules based on a combination of ruleset and rule', async () => {
    const json: OpenAPIV3.Document = {
      ...defaultEmptySpec,
      paths: {
        '/api/users': {
          get: {
            description: 'hello',
            responses: {},
          },
          post: {
            responses: {},
          },
        },
        '/api/users/{userId}': {
          get: {
            description: 'a',
            responses: {},
          },
          post: {
            responses: {},
          },
        },
      },
    };
    const mockFn = jest.fn();

    const ruleset = new Ruleset({
      name: 'ruleset for get',
      matches: (context) => context.operation.method === 'get',
      rules: [
        new OperationRule({
          name: 'operation description',
          matches: (operation) => operation.path === '/api/users',
          rule: (operationAssertions) => {
            operationAssertions.requirement(
              'must contain a description',
              mockFn
            );
          },
        }),
      ],
    });
    const ruleRunner = new RuleRunner([ruleset]);
    await ruleRunner.runRulesWithFacts(createRuleInputs(json, json));

    expect(mockFn.mock.calls.length).toBe(1);
    expect(mockFn.mock.calls[0][0].method).toBe('get');
    expect(mockFn.mock.calls[0][0].path).toBe('/api/users');
  });

  describe('docsLink', () => {
    const json: OpenAPIV3.Document = {
      ...defaultEmptySpec,
      paths: {
        '/api/users': {
          post: {
            responses: {},
          },
        },
      },
    };

    test('ruleset doclink without rule doclink', async () => {
      const expectedDoclink = 'hello';
      const ruleset = new Ruleset({
        name: 'ruleset for get',
        docsLink: expectedDoclink,
        rules: [
          new OperationRule({
            name: 'operation description',
            rule: (operationAssertions) => {
              operationAssertions.requirement(
                'must contain a description',
                jest.fn()
              );
            },
          }),
        ],
      });
      const ruleRunner = new RuleRunner([ruleset]);
      const results = await ruleRunner.runRulesWithFacts(
        createRuleInputs(json, json)
      );
      expect(results[0].docsLink).toBe(expectedDoclink);
    });

    test('ruleset doclink with rule doclink', async () => {
      const expectedDoclink = 'hello';
      const ruleset = new Ruleset({
        name: 'ruleset for get',
        docsLink: 'not the docs you are looking for',
        rules: [
          new OperationRule({
            name: 'operation description',
            docsLink: expectedDoclink,
            rule: (operationAssertions) => {
              operationAssertions.requirement(
                'must contain a description',
                jest.fn()
              );
            },
          }),
        ],
      });
      const ruleRunner = new RuleRunner([ruleset]);
      const results = await ruleRunner.runRulesWithFacts(
        createRuleInputs(json, json)
      );
      expect(results[0].docsLink).toBe(expectedDoclink);
    });
  });

  // test('exemptions', () => {})
});
