import { test, expect, describe } from '@jest/globals';
import { RuleRunner } from '../rule-runner';
import { SpectralRule } from '../extended-rules/spectral-rule';
import {
  Spectral,
  RulesetDefinition as SpectralRulesetDefinition,
} from '@stoplight/spectral-core';
import { oas } from '@stoplight/spectral-rulesets';
import { OpenAPIV3, defaultEmptySpec, diff } from '@useoptic/openapi-utilities';

const spectral = new Spectral();
spectral.setRuleset({
  extends: [[oas as SpectralRulesetDefinition, 'all']],
  rules: {},
});

describe('spectral rule test', () => {
  const ruleRunner = new RuleRunner([
    new SpectralRule({
      name: 'spectral-rules',
      spectral,
    }),
  ]);

  test('runs spectral rules on added', async () => {
    const before: OpenAPIV3.Document = { ...defaultEmptySpec };
    const after: OpenAPIV3.Document = {
      ...defaultEmptySpec,
      paths: {
        '/api': {
          get: {
            responses: {},
          },
        },
      },
    };
    const diffs = diff(before, after);
    const resultsWithChanges = await ruleRunner.runRules({
      diffs,
      fromSpec: before,
      toSpec: after,
      context: {},
    });

    expect(resultsWithChanges.length > 0).toBe(true);
    expect(resultsWithChanges.every((r) => r.passed)).toBe(false);
    expect(resultsWithChanges).toMatchSnapshot();

    const resultsAgainstSelf = await ruleRunner.runRules({
      diffs,
      fromSpec: after,
      toSpec: after,
      context: {},
    });
    expect(resultsAgainstSelf.length === 0).toBe(true);
  });
});
