import { IFact, IChange, OpenAPIV3, Result } from '@useoptic/openapi-utilities';
import {
  Ruleset,
  SpecificationRule,
  OperationRule,
  RequestRule,
  ResponseRule,
} from '../rules';
import { groupFacts } from './group-facts';

type Rules =
  | Ruleset
  | SpecificationRule
  | OperationRule
  | RequestRule
  | ResponseRule;

export class RuleRunner {
  constructor(private rules: Rules) {}

  runRulesWithFacts({
    currentFacts,
    nextFacts,
    changelog,
  }: {
    context: any;
    nextFacts: IFact[];
    currentFacts: IFact[];
    changelog: IChange[];
    nextJsonLike: OpenAPIV3.Document;
    currentJsonLike: OpenAPIV3.Document;
  }): Result[] {
    const groupedFacts = groupFacts({
      beforeFacts: currentFacts,
      afterFacts: nextFacts,
      changes: changelog,
    });

    return [];
  }
}
