import { test, expect, describe } from '@jest/globals';

import { OpenAPITraverser, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { RuleRunner } from '../rule-runner';

describe('spectral rules', () => {
  const ruleRunner = new RuleRunner([]);
  test('runs spectral rules', async () => {
    const nextJson: OpenAPIV3.Document = {
      openapi: '3.0.1',
      info: {
        title: 'hello',
        version: '1',
      },
      paths: {},
    };
    const traverser = new OpenAPITraverser();

    traverser.traverse(nextJson);
    const nextFacts = [...traverser.facts()];
    const results = await ruleRunner.runSpectralRules({
      nextJsonLike: nextJson,
      nextFacts,
      ruleset: {
        'openapi-tags': 'off',
        'operation-tags': 'off',
        'info-contact': 'off',
        'info-description': 'off',
        'info-license': 'off',
        'license-url': 'off',
        'oas3-unused-component': 'off',
      },
    });

    expect(results.length > 0).toBe(true);
    expect(results).toMatchSnapshot();
  });

  test('does not run spectral rules on an empty spec', async () => {
    const nextJson = {
      ['x-optic-ci-empty-spec']: true,
      openapi: '3.0.1',
      info: {
        title: 'hello',
        version: '1',
      },
      paths: {},
    } as OpenAPIV3.Document;
    const traverser = new OpenAPITraverser();

    traverser.traverse(nextJson);
    const nextFacts = [...traverser.facts()];
    const results = await ruleRunner.runSpectralRules({
      nextJsonLike: nextJson,
      nextFacts,
      ruleset: {
        'openapi-tags': 'off',
        'operation-tags': 'off',
        'info-contact': 'off',
        'info-description': 'off',
        'info-license': 'off',
        'license-url': 'off',
        'oas3-unused-component': 'off',
      },
    });

    expect(results.length === 0).toBe(true);
  });
});
