import {
  OpenAPITraverser,
  normalizeOpenApiPath,
} from './openapi3/implementations/openapi3/openapi-traverser';
import { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import { factsToChangelog } from './openapi3/sdk/facts-to-changelog';
export {
  FlatOpenAPIV2,
  FlatOpenAPIV3,
  FlatOpenAPIV3_1,
} from './flat-openapi-types';

import {
  ConceptualLocation,
  IChange,
  IFact,
  ILocation,
  OpenApiFact,
  OpenApiFieldFact,
  OpenApiBodyFact,
  OpenApiBodyExampleFact,
  OpenApiHeaderFact,
  OpenApiKind,
  OpenApiParameterKind,
  OpenApiOperationFact,
  OpenApiRequestParameterFact,
  OpenApiResponseFact,
  OpenApiComponentSchemaExampleFact,
  OperationLocation,
  QueryParameterLocation,
  PathParameterLocation,
  HeaderParameterLocation,
  CookieParameterLocation,
  ResponseHeaderLocation,
  ResponseLocation,
  BodyLocation,
  BodyExampleLocation,
  ComponentSchemaLocation,
  FieldLocation,
  ChangeType,
  OpenApiSpecificationFact,
  OpenApi3SchemaFact,
  FactVariant,
  ChangeVariant,
  OpenApiKindToFact,
  OpenApiRequestFact,
} from './openapi3/sdk/types';
import {
  isFactVariant,
  isChangeVariant,
  isFactOrChangeVariant,
} from './openapi3/sdk/isType';
import {
  sourcemapReader,
  getSourcemapLink,
  GetSourcemapOptions,
} from './openapi3/implementations/openapi3/sourcemap-reader';

export { defaultEmptySpec } from './openapi3/constants';
export * from './openapi3/implementations/openapi3/types';
export * from './utilities/id';

export { SPEC_TAG_REGEXP, sanitizeGitTag } from './specs/tags';

export {
  getFactForJsonPath,
  constructFactTree,
  FactTree,
} from './openapi3/json-path-interpreters';

export { UserError } from './errors';
export { getEndpointsChanges } from './utilities/changelog';
export {
  BodyChange,
  ContentType,
  OpenApiEndpointChange,
  StatusCode,
  groupChangesAndRules,
} from './utilities/group-changes';
export { traverseSpec } from './utilities/traverse-spec';
export { compareChangesByPath } from './utilities/compare-changes-by-path';
export {
  getLabel,
  getOperationsChanged,
  getOperationsChangedLabel,
} from './utilities/count-changed-operations';
export * from './swagger2';
export {
  compareSpecs,
  CompareSpecResults,
} from './compare-specs/compare-specs';
export { groupDiffsByEndpoint } from './openapi3/group-diff';
export { ObjectDiff, typeofDiff, diff, reconcileDiff } from './diff/diff';
export {
  RuleResult,
  Severity,
  textToSev,
  sevToText,
  SeverityTextOptions,
  SeverityText,
} from './results';
export { OpenApiV3Traverser, OAS3 } from './openapi3/traverser';
export { isTruthyStringValue } from './utilities/truthy';
export {
  sourcemapReader,
  GetSourcemapOptions,
  getSourcemapLink,
  OpenApiFact,
  OpenAPITraverser,
  factsToChangelog,
  ConceptualLocation,
  IChange,
  OpenApiFieldFact,
  OpenApiBodyFact,
  OpenApiBodyExampleFact,
  OpenAPIV2,
  OpenAPIV3,
  OpenAPIV3_1,
  OpenApiKind,
  OpenApiParameterKind,
  OpenApiOperationFact,
  OpenApiHeaderFact,
  IFact,
  ILocation,
  OpenApiSpecificationFact,
  OpenApiRequestParameterFact,
  OpenApiResponseFact,
  OpenApiComponentSchemaExampleFact,
  OpenApi3SchemaFact,
  OperationLocation,
  QueryParameterLocation,
  PathParameterLocation,
  HeaderParameterLocation,
  CookieParameterLocation,
  ResponseHeaderLocation,
  ResponseLocation,
  BodyLocation,
  BodyExampleLocation,
  ComponentSchemaLocation,
  FieldLocation,
  ChangeType,
  FactVariant,
  ChangeVariant,
  OpenApiKindToFact,
  isFactVariant,
  isChangeVariant,
  isFactOrChangeVariant,
  OpenApiRequestFact,
};
export { normalizeOpenApiPath };
export * from './coverage/coverage';

export * from './types';

const packageJson = require('../package.json');
export const version = packageJson.version;
