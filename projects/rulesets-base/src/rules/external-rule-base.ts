import {
  IChange,
  IFact,
  ObjectDiff,
  OpenAPIV3,
  Result,
  RuleResult,
} from '@useoptic/openapi-utilities';
import { OpenAPIFactNodes } from '../rule-runner/rule-runner-types';
import { OpenAPIDocument } from '..';

class NotImplementedError extends Error {}

export class ExternalRuleBase {
  constructor() {
    this.type = 'external-rule';
  }
  public type: 'external-rule';

  static isInstance(v: any): v is ExternalRuleBase {
    return v?.type === 'external-rule';
  }

  runRules(inputs: {
    context: any;
    nextFacts: IFact[];
    currentFacts: IFact[];
    changelog: IChange[];
    nextJsonLike: OpenAPIDocument;
    currentJsonLike: OpenAPIDocument;
    groupedFacts: OpenAPIFactNodes;
  }): Promise<Result[]> {
    throw new NotImplementedError();
  }

  runRulesV2(inputs: {
    context: any;
    diffs: ObjectDiff[];
    fromSpec: OpenAPIDocument;
    toSpec: OpenAPIDocument;
    groupedFacts: OpenAPIFactNodes;
  }): Promise<RuleResult[]> {
    throw new NotImplementedError();
  }
}
