import { IFact, IChange, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

export type RuleRunner = {
  runRulesWithFacts: (inputs: {
    context: any;
    nextFacts: IFact[];
    currentFacts: IFact[];
    changelog: IChange[];
    nextJsonLike: OpenAPIV3.Document;
    currentJsonLike: OpenAPIV3.Document;
    // TODO RA-V2 remove Promise<Result[]>
  }) => Result[] | Promise<Result[]>;
};
