/*

  Interface diffing traffic
   - produces a diff from the
   - debug one (just to get rolling)
     - HTTP Interaction
     - HAR
     - Postman?

   */
import { ApiTraffic } from '../traffic/types';
import { OpenAPIDiffingQuestions } from '../read/types';
import {
  ConceptualLocation,
  FieldLocation,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { JsonSchemaKnownKeyword } from './differs/json-schema-json-diff/plugins/plugin-types';
import { JsonSchemaJsonDiffer } from './differs/json-schema-json-diff/types';
import { JsonPath } from '@useoptic/openapi-io';

export interface IDiffService {
  compare(traffic: ApiTraffic): Promise<{ diffs: IDiff[]; errors: string[] }>;
  jsonSchemaDiffer: JsonSchemaJsonDiffer;
}

export type DiffServiceFactoryFunction = (
  spec: OpenAPIDiffingQuestions
) => IDiffService;

export enum DiffType {
  UnmatchedPath = 'UnmatchedPath',
  UnmatchedMethod = 'UnmatchedMethod',
  UnmatchedResponse = 'UnmatchedResponse',
  BodyAdditionalProperty = 'BodyAdditionalProperty',
  BodyMissingRequiredProperty = 'BodyMissingRequiredProperty',
  BodyUnmatchedType = 'BodyUnmatchedType',
  QueryAdditionalParameter = 'QueryAdditionalParameter',
}

export interface IDiff {
  type: DiffType;
}

export interface UnmatchedPath extends IDiff {
  type: DiffType.UnmatchedPath;
  path: string;
  method: OpenAPIV3.HttpMethods;
  closestMatch: string;
}

export interface UnmatchedMethod extends IDiff {
  type: DiffType.UnmatchedMethod;
  path: string;
  method: OpenAPIV3.HttpMethods;
}

export interface UnmatchedResponse extends IDiff {
  type: DiffType.UnmatchedResponse;
  path: string;
  method: OpenAPIV3.HttpMethods;
  statusCode: string;
}
////////////////////////////////////////////////////////////

export interface QueryAdditionalParameter extends IDiff {
  type: DiffType.QueryAdditionalParameter;
  path: string;
  name: string;
  method: OpenAPIV3.HttpMethods;
  example: any;
}

////////////////////////////////////////////////////////////

export interface BodyAdditionalProperty extends IDiff {
  type: DiffType.BodyAdditionalProperty;
  propertyExamplePath: JsonPath;
  parentObjectPath: JsonPath;
  key: string;
  example: any;
  propertyPath: JsonPath;
  keyword: JsonSchemaKnownKeyword.additionalProperties;
  schemaPath: JsonPath;
  instancePath: JsonPath;
  location: FieldLocation;
}

export interface BodyMissingRequiredProperty extends IDiff {
  type: DiffType.BodyMissingRequiredProperty;
  keyword: JsonSchemaKnownKeyword.required;
  parentObjectPath: JsonPath;
  propertyPath: JsonPath;
  key: string;
  schemaPath: JsonPath;
  instancePath: JsonPath;
  location: FieldLocation;
}

export interface BodyPropertyUnmatchedType extends IDiff {
  type: DiffType.BodyUnmatchedType;
  keyword: JsonSchemaKnownKeyword.type | JsonSchemaKnownKeyword.oneOf;
  propertyPath: JsonPath;
  key: string;
  example: any;
  schemaPath: JsonPath;
  instancePath: JsonPath;
  location: FieldLocation;
}

export type ShapeDiffTypes =
  | BodyMissingRequiredProperty
  | BodyAdditionalProperty
  | BodyPropertyUnmatchedType;

type DiffKinds =
  | UnmatchedMethod
  | UnmatchedPath
  | UnmatchedResponse
  | QueryAdditionalParameter
  | ShapeDiffTypes;

/*
  Diff Result Types
 */

export interface DiffResult {
  isMatch: boolean;
}
export interface MatchedWithContext<Context> extends DiffResult {
  isMatch: true;
  context: Context;
}
export interface Matched extends DiffResult {
  isMatch: true;
}

export interface Diff extends DiffResult {
  isMatch: false;
  diffs: DiffKinds[];
}

export interface DiffError extends DiffResult {
  isMatch: false;
  error: string;
}

export interface EitherDiffResult<Context = undefined> {
  context: Context;
  error: string;
  diffs: DiffKinds[];
  isMatch: boolean;
  isDiff: boolean;
}

export function EitherDiffResult<Context>(
  i: DiffResult
): EitherDiffResult<Context> {
  return {
    isDiff: !i.isMatch,
    isMatch: i.isMatch,
    context: i.hasOwnProperty('context')
      ? (i as MatchedWithContext<Context>).context
      : undefined,
    error: i.hasOwnProperty('error') ? (i as DiffError).error : undefined,
    diffs: i.hasOwnProperty('diffs') ? (i as Diff).diffs : [],
  };
}

export const DiffResult = {
  match: () => {
    return EitherDiffResult<undefined>({ isMatch: true } as Matched);
  },
  matchWithContext: <Context>(context: Context) => {
    return EitherDiffResult<Context>({
      isMatch: true,
      context,
    } as MatchedWithContext<Context>);
  },
  diff: (diffs: DiffKinds[]) => {
    return EitherDiffResult<undefined>({
      isMatch: false,
      diffs,
    } as Diff);
  },
  error: (error: string) => {
    return EitherDiffResult<undefined>({ isMatch: false, error } as DiffError);
  },
};
