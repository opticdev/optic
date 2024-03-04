import {
  OpenAPIV3,
  OpenAPITraverser,
  factsToChangelog,
  Result,
  defaultEmptySpec,
} from '@useoptic/openapi-utilities';
import { RuleRunner } from './rule-runner';
import { Rule, Ruleset } from './rules';
import { ExternalRuleBase } from './rules/external-rule-base';
import { OpenAPIDocument } from '.';

export const createRuleInputs = (
  beforeJson: OpenAPIDocument,
  afterJson: OpenAPIDocument
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

export const runRulesWithInputs = (
  rules: (Rule | Ruleset)[],
  beforeJson: OpenAPIDocument,
  afterJson: OpenAPIDocument
): Promise<Result[]> => {
  const ruleRunner = new RuleRunner(rules);
  return ruleRunner.runRulesWithFacts(createRuleInputs(beforeJson, afterJson));
};

export const externalRulesWithInputs = (
  rules: ExternalRuleBase,
  beforeJson: OpenAPIDocument,
  afterJson: OpenAPIDocument
): Promise<Result[]> => {
  const ruleRunner = new RuleRunner([rules]);
  return ruleRunner.runRulesWithFacts(createRuleInputs(beforeJson, afterJson));
};

export const createEmptySpec = (): OpenAPIV3.Document =>
  ({
    ...defaultEmptySpec,
    paths: {},
    info: {
      ...defaultEmptySpec.info,
    },
  }) as OpenAPIV3.Document;
