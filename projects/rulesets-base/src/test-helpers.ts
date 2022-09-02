import {
  OpenAPIV3,
  factsToChangelog,
  Result,
  defaultEmptySpec,
  OpenAPI3Traverser,
} from '@useoptic/openapi-utilities';
import { RuleRunner } from './rule-runner';
import { Rule, Ruleset } from './rules';

export const createRuleInputs = (
  beforeJson: OpenAPIV3.Document,
  afterJson: OpenAPIV3.Document
): Parameters<RuleRunner['runRulesWithFacts']>[0] => {
  const currentTraverser = new OpenAPI3Traverser();
  const nextTraverser = new OpenAPI3Traverser();

  currentTraverser.traverse(beforeJson);
  const currentFacts = [...currentTraverser.facts()];
  nextTraverser.traverse(afterJson);

  const nextFacts = [...nextTraverser.facts()];
  const changes = factsToChangelog(currentFacts, nextFacts);
  return {
    context: {},
    currentFacts,
    nextFacts,
    changelog: changes,
    currentJsonLike: beforeJson,
    nextJsonLike: afterJson,
  };
};

export const runRulesWithInputs = (
  rules: (Rule | Ruleset)[],
  beforeJson: OpenAPIV3.Document,
  afterJson: OpenAPIV3.Document
): Result[] => {
  const ruleRunner = new RuleRunner(rules);
  return ruleRunner.runRulesWithFacts(createRuleInputs(beforeJson, afterJson));
};

export const createEmptySpec = (): OpenAPIV3.Document => ({
  ...defaultEmptySpec,
  paths: {},
  info: {
    ...defaultEmptySpec.info,
  },
});
