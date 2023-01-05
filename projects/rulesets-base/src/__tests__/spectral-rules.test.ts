import { jest, test, expect, describe } from '@jest/globals'
import {
  Spectral,
  RulesetDefinition as SpectralRulesetDefinition,
} from '@stoplight/spectral-core';
import { oas } from '@stoplight/spectral-rulesets';
import { defaultEmptySpec, OpenAPIV3 } from '@useoptic/openapi-utilities';

import { SpectralRule } from '../extended-rules/spectral-rule';
import { createRuleInputs } from '../test-helpers';
import { RuleRunner } from '../rule-runner';

const emptySpec = {
  ...defaultEmptySpec,
  'x-optic-ci-empty-spec': true,
};

const specWithLintIssues: OpenAPIV3.Document = {
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

const specWithExemptions: OpenAPIV3.Document = {
  ...defaultEmptySpec,
  'x-optic-exemptions': 'spectral',
  servers: [{ url: 'http://optic.com' }],
  paths: {
    '/api/users': {
      get: {
        description: 'hello',
        responses: {},
      },
    },
  },
} as OpenAPIV3.Document;

describe('SpectralRule', () => {
  test('spectral rules run', async () => {
    const spectral = new Spectral();
    spectral.setRuleset(oas as SpectralRulesetDefinition);

    const ruleRunner = new RuleRunner([
      new SpectralRule({ spectral, name: 'spectral' }),
    ]);

    const results = await ruleRunner.runRulesWithFacts(
      createRuleInputs(specWithLintIssues, specWithLintIssues)
    );
    expect(results.every((result) => result.passed)).toBe(false);
    expect(results).toMatchSnapshot();
  });

  test('lifecycle rules can be applied to spectral rules', async () => {
    const spectral = new Spectral();
    spectral.setRuleset(oas as SpectralRulesetDefinition);

    const ruleRunner = new RuleRunner([
      new SpectralRule({ spectral, name: 'spectral', applies: 'added' }),
    ]);
    const resultsAdded = await ruleRunner.runRulesWithFacts(
      createRuleInputs(emptySpec, specWithLintIssues)
    );
    const resultsSame = await ruleRunner.runRulesWithFacts(
      createRuleInputs(specWithLintIssues, specWithLintIssues)
    );
    expect(resultsAdded.every((result) => result.passed)).toBe(false);
    expect(resultsSame.every((result) => result.passed)).toBe(true);
    expect(resultsAdded).toMatchSnapshot();
    expect(resultsSame).toMatchSnapshot();
  });

  test('can be exempted', async () => {
    const spectral = new Spectral();
    spectral.setRuleset(oas as SpectralRulesetDefinition);

    const ruleRunner = new RuleRunner([
      new SpectralRule({ spectral, name: 'spectral' }),
    ]);
    const results = await ruleRunner.runRulesWithFacts(
      createRuleInputs(specWithExemptions, specWithExemptions)
    );

    expect(results.every((result) => result.passed)).toBe(false);
    expect(results.some((result) => result.exempted)).toBe(true);
  });
});
