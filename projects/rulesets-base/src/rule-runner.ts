import { IFact, IChange, OpenAPIV3, Result } from '@useoptic/openapi-utilities';
import {
  Ruleset,
  SpecificationRule,
  OperationRule,
  RequestRule,
  ResponseRule,
} from './rules';

// TODO maybe create a class instead
export const createRuleRunner = (
  rules: (
    | Ruleset
    | SpecificationRule
    | OperationRule
    | RequestRule
    | ResponseRule
  )[]
) => ({
  // Matches the legacy rule runner interface
  runRulesWithFacts: (options: {
    context: any;
    nextFacts: IFact[];
    currentFacts: IFact[];
    changelog: IChange[];
    nextJsonLike: OpenAPIV3.Document;
    currentJsonLike: OpenAPIV3.Document;
  }): Result[] => {
    // TODO implement rule runner
    return [];
  },
});
