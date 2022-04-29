import {
  OpenAPIV3,
  OpenAPITraverser,
  factsToChangelog,
} from '@useoptic/openapi-utilities';
import { RuleRunner } from '../rule-runner';

export const createRuleInputs = (
  beforeJson: OpenAPIV3.Document,
  afterJson: OpenAPIV3.Document
): Parameters<RuleRunner['runRulesWithFacts']>[0] => {
  const currentTraverser = new OpenAPITraverser();
  const nextTraverser = new OpenAPITraverser();

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
