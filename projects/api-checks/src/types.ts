import { IFact, IChange, OpenAPIV3, Result } from '@useoptic/openapi-utilities';
import { RulesetDefinition as SpectralRulesetDefinition } from '@stoplight/spectral-core';

export type SpectralInput = Extract<
  SpectralRulesetDefinition,
  { extends: any; rules: any }
>['rules'];

export type RuleRunner = {
  runSpectralRules?: (inputs: {
    ruleset: SpectralInput;
    nextFacts: IFact[];
    nextJsonLike: OpenAPIV3.Document;
  }) => Promise<Result[]>;

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
