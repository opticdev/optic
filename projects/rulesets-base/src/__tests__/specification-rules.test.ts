import { defaultEmptySpec } from '@useoptic/openapi-utilities';
import { RuleError } from '../errors';
import { RuleRunner } from '../rule-runner';
import { SpecificationRule } from '../rules';
import { createRuleInputs } from '../test-helpers';

describe('SpecificationRule', () => {
  describe('requirement', () => {
    const ruleRunner = new RuleRunner([
      new SpecificationRule({
        name: 'operation description',
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

    test('passing assertion', () => {
      const json = {
        ...defaultEmptySpec,
        ['x-stability']: 'abc',
      };

      const results = ruleRunner.runRulesWithFacts(
        createRuleInputs(json, json)
      );
      expect(results.length > 0).toBe(true);
      expect(results).toMatchSnapshot();
      for (const result of results) {
        expect(result.passed).toBe(true);
      }
    });

    test('failing assertion', () => {
      const json = {
        ...defaultEmptySpec,
      };

      const results = ruleRunner.runRulesWithFacts(
        createRuleInputs(json, json)
      );
      expect(results.length > 0).toBe(true);
      expect(results).toMatchSnapshot();
      for (const result of results) {
        expect(result.passed).toBe(false);
      }
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

      test('passing assertion', () => {
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

        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', () => {
        const json = {
          ...defaultEmptySpec,
        };

        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });
  });
});
