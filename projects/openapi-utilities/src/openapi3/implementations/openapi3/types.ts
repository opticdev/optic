import { RulesetDefinition as SpectralRulesetDefinition } from '@stoplight/spectral-core';
import { IChange, IFact } from '../../sdk/types';
import { OpenAPIV3 } from 'openapi-types';
import { Result } from '../../../types';

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
  }) => Result[];
};
