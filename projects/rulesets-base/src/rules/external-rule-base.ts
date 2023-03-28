import {
  IChange,
  IFact,
  ObjectDiff,
  OpenAPIV3,
  Result,
  RuleResult,
} from '@useoptic/openapi-utilities';

class NotImplementedError extends Error {}

export class ExternalRuleBase {
  constructor() {
    this.type = 'external-rule';
  }
  public type: 'external-rule';

  static isInstance(v: any): v is ExternalRuleBase {
    return v?.type === 'external-rule';
  }

  runRulesV2(inputs: {
    context: any;
    diffs: ObjectDiff[];
    fromSpec: OpenAPIV3.Document;
    toSpec: OpenAPIV3.Document;
  }): Promise<RuleResult[]> {
    throw new NotImplementedError();
  }
}
