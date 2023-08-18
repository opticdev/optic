import { RulesetDefinition as SpectralRulesetDefinition } from '@stoplight/spectral-core';
import { OpenAPIV3 } from 'openapi-types';
import { YAMLNode } from 'yaml-ast-parser';
import { IChange, IFact } from '../../sdk/types';
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
  }) => Promise<Result[]>;
};

export type JsonPath = string;
export type FileReference = number;

export type ToSource = [FileReference, JsonPath];

export type ILookupPathResult = {
  filePath: string;
  startsAt: JsonPath;
  contents: string;
  astNode: YAMLNode;
};
export type ILookupFileResult = { filePath: string; startsAt: JsonPath };

export type SerializedSourcemap = {
  rootFilePath: string;
  files: Array<{
    path: string;
    index: number;
    contents: string;
    sha256: string;
  }>;

  refMappings: { [key: JsonPath]: ToSource };
};

export type FileWithSerializedSourcemap = {
  jsonLike: OpenAPIV3.Document;
  sourcemap: SerializedSourcemap;
};

export type SourcemapLine = {
  filePath: string;
  startLine: number;
  endLine: number;
  startPosition: number;
  endPosition: number;
};
