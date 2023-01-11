import { OpenAPITraverser } from './openapi3/implementations/openapi3/openapi-traverser';
import { OpenAPIV3 } from 'openapi-types';
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
import { sourcemapReader } from './openapi3/implementations/openapi3/sourcemap-reader';

export { defaultEmptySpec } from './openapi3/constants';
export * from './ci-types';
export { generateSpecResults } from './openapi3/implementations/openapi3/generate-spec-results';
export * from './openapi3/implementations/openapi3/types';

export { SPEC_TAG_REGEXP } from './specs/tags';

export {
  getFactForJsonPath,
  constructFactTree,
  FactTree,
} from './openapi3/json-path-interpreters';

export { UserError } from './errors';
export {
  findOpticCommentId,
  OPTIC_COMMENT_SURVEY_LINK,
} from './utilities/shared-comment';
export {
  createCommentBody,
  createMultiSessionsCommentBody,
} from './utilities/compare-comment';
export {
  logComparison,
  generateComparisonLogs,
  getComparisonLogs,
} from './utilities/comparison-render';
export {
  BodyChange,
  ContentType,
  OpenApiEndpointChange,
  StatusCode,
  groupChangesAndRules,
} from './utilities/group-changes';
export { traverseSpec } from './utilities/traverse-spec';
export { terminalChangelog } from './utilities/terminal-changelog';
export { jsonChangelog } from './utilities/json-changelog';
export { generateChangelogData } from './utilities/generate-changelog-data';
export { compareChangesByPath } from './utilities/compare-changes-by-path';
export {
  getOperationsModifsLabel,
  countOperationsModifications,
  getLabel,
} from './utilities/count-changed-operations';

export {
  sourcemapReader,
  OpenApiFact,
  OpenAPITraverser,
  factsToChangelog,
  ConceptualLocation,
  IChange,
  OpenApiFieldFact,
  OpenApiBodyFact,
  OpenApiBodyExampleFact,
  OpenAPIV3,
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

export * from './types';

const packageJson = require('../package.json');
export const version = packageJson.version;
