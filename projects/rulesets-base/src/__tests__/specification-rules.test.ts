import { jest, test, expect, describe } from '@jest/globals';

import { defaultEmptySpec, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { RuleError } from '../errors';
import { RuleRunner } from '../rule-runner';
import { SpecificationRule } from '../rules';
import { createRuleInputs } from '../test-helpers';

describe('SpecificationRule', () => {
  describe('rulesContext', () => {
    const emptySpec = {
      ...defaultEmptySpec,
      'x-optic-ci-empty-spec': true,
    };
    const json: OpenAPIV3.Document = {
      ...defaultEmptySpec,
      servers: [{ url: 'http://optic.com' }],
      paths: {
        '/api/users': {
          get: {
            description: 'hello',
            responses: {},
          },
        },
      },
    };
    test('before', async () => {
      const mockFn = jest.fn();
      const ruleRunner = new RuleRunner([
        new SpecificationRule({
          name: 'operation description',
          rule: mockFn,
        }),
      ]);

      await ruleRunner.runRulesWithFacts(createRuleInputs(json, emptySpec));

      expect(mockFn.mock.calls.length > 0).toBe(true);
      const ruleContext = mockFn.mock.calls[0][1];
      expect(ruleContext).toMatchSnapshot();
    });

    test('after', async () => {
      const mockFn = jest.fn();
      const ruleRunner = new RuleRunner([
        new SpecificationRule({
          name: 'operation description',
          rule: mockFn,
        }),
      ]);

      await ruleRunner.runRulesWithFacts(
        createRuleInputs(defaultEmptySpec, json)
      );

      expect(mockFn.mock.calls.length > 0).toBe(true);
      const ruleContext = mockFn.mock.calls[0][1];
      expect(ruleContext).toMatchSnapshot();
    });

    test('before is empty spec', async () => {
      const mockFn = jest.fn();
      const ruleRunner = new RuleRunner([
        new SpecificationRule({
          name: 'operation description',
          rule: mockFn,
        }),
      ]);

      await ruleRunner.runRulesWithFacts(createRuleInputs(emptySpec, json));

      expect(mockFn.mock.calls.length > 0).toBe(true);
      const ruleContext = mockFn.mock.calls[0][1] as any;
      expect(ruleContext.specification.change).toBe('added');
      expect(ruleContext).toMatchSnapshot();
    });

    test('after is empty spec', async () => {
      const mockFn = jest.fn();
      const ruleRunner = new RuleRunner([
        new SpecificationRule({
          name: 'operation description',
          rule: mockFn,
        }),
      ]);

      await ruleRunner.runRulesWithFacts(createRuleInputs(json, emptySpec));

      expect(mockFn.mock.calls.length > 0).toBe(true);
      const ruleContext = mockFn.mock.calls[0][1] as any;
      expect(ruleContext.specification.change).toBe('removed');
      expect(ruleContext).toMatchSnapshot();
    });
  });

  describe('requirement', () => {
    const ruleName = 'operation description';
    const ruleRunner = new RuleRunner([
      new SpecificationRule({
        name: ruleName,
        rule: (specificationAssertions) => {
          specificationAssertions.requirement(
            'must contain x-stability',
            (specification) => {
              if (!specification.value['x-stability']) {
                throw new RuleError({
                  message: 'spec does not have x-stability',
                });
              }
            }
          );
        },
      }),
    ]);

    test('passing assertion', async () => {
      const json = {
        ...defaultEmptySpec,
        ['x-stability']: 'abc',
      };

      const results = await ruleRunner.runRulesWithFacts(
        createRuleInputs(json, json)
      );
      expect(results.length > 0).toBe(true);
      expect(results).toMatchSnapshot();
      for (const result of results) {
        expect(result.passed).toBe(true);
      }
    });

    test('failing assertion', async () => {
      const json = {
        ...defaultEmptySpec,
      };

      const results = await ruleRunner.runRulesWithFacts(
        createRuleInputs(json, json)
      );
      expect(results.length > 0).toBe(true);
      expect(results).toMatchSnapshot();
      for (const result of results) {
        expect(result.passed).toBe(false);
      }
    });

    test('exemption', async () => {
      const json = {
        ...defaultEmptySpec,
        'x-optic-exemptions': [ruleName],
      };

      const results = await ruleRunner.runRulesWithFacts(
        createRuleInputs(json, json)
      );
      expect(results.length).toBe(1);
      const result = results[0];
      expect(result.exempted).toBe(true);
      expect(result.passed).toBe(false);
    });
  });

  describe('custom matchers', () => {
    describe('matches', () => {
      const ruleRunner = new RuleRunner([
        new SpecificationRule({
          name: 'operation description',
          rule: (specificationAssertions) => {
            specificationAssertions.requirement.matches({
              info: {
                license: {},
              },
            });
          },
        }),
      ]);

      test('passing assertion', async () => {
        const json = {
          ...defaultEmptySpec,
          info: {
            ...defaultEmptySpec.info,
            license: {
              name: 'MIT',
              url: 'some-url',
            },
          },
        };

        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', async () => {
        const json = {
          ...defaultEmptySpec,
        };

        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });

      test('inverted assertion', async () => {
        const ruleRunner = new RuleRunner([
          new SpecificationRule({
            name: 'operation description',
            rule: (specificationAssertions) => {
              specificationAssertions.requirement.not.matches({
                info: {
                  license: {},
                },
              });
            },
          }),
        ]);
        const json = {
          ...defaultEmptySpec,
        };

        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });
    });

    describe('matchesOneOf', () => {
      const ruleRunner = new RuleRunner([
        new SpecificationRule({
          name: 'operation description',
          rule: (specificationAssertions) => {
            specificationAssertions.requirement.matchesOneOf([
              {
                info: {
                  license: {},
                },
              },
              {
                security: [],
              },
            ]);
          },
        }),
      ]);

      test('passing assertion', async () => {
        const json = {
          ...defaultEmptySpec,
          info: {
            ...defaultEmptySpec.info,
            license: {
              name: 'MIT',
              url: 'some-url',
            },
          },
        };

        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', async () => {
        const json = {
          ...defaultEmptySpec,
        };

        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });

      test('inverted assertion', async () => {
        const ruleRunner = new RuleRunner([
          new SpecificationRule({
            name: 'operation description',
            rule: (specificationAssertions) => {
              specificationAssertions.requirement.not.matchesOneOf([
                {
                  info: {
                    license: {},
                  },
                },
                {
                  security: [],
                },
              ]);
            },
          }),
        ]);
        const json = {
          ...defaultEmptySpec,
        };

        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });
    });
  });
});
