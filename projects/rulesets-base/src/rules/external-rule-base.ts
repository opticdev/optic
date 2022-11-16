import { IChange, IFact, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

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
    nextJsonLike: OpenAPIV3.Document;
    currentJsonLike: OpenAPIV3.Document;
  }): Promise<Result[]> {
    throw new NotImplementedError();
  }
}
