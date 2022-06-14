import { OpenAPITraverser } from './openapi3/implementations/openapi3/openapi-traverser';
import { validateOpenApiV3Document } from './openapi3/implementations/openapi3/validator';
import { OpenAPIV3 } from 'openapi-types';
import { factsToChangelog } from './openapi3/sdk/facts-to-changelog';
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
  FactVariant,
  ChangeVariant,
  OpenApiKindToFact,
  OpenApiRequestFact,
} from './openapi3/sdk/types';
import { isFactVariant, isChangeVariant } from './openapi3/sdk/isType';
import { sourcemapReader } from './openapi3/implementations/openapi3/sourcemap-reader';

import {
  LookupLineResult,
  LookupLineResultWithFilepath,
} from './render/ast-helpers';
export { defaultEmptySpec } from './openapi3/constants';
export * from './ci-types';
export { generateSpecResults } from './openapi3/implementations/openapi3/generate-spec-results';
export * from './openapi3/implementations/openapi3/types';

export { UserError } from './errors';
export {
  findOpticCommentId,
  OPTIC_COMMENT_SURVEY_LINK,
} from './utilities/shared-comment';
export { createCommentBody } from './utilities/compare-comment';
export { logComparison } from './utilities/comparison-render';
export { sendGithubMessage } from './utilities/send-github-message';
export { trackEvent, initSegment, flushEvents } from './utilities/segment';

export {
  sourcemapReader,
  validateOpenApiV3Document,
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
  LookupLineResult,
  LookupLineResultWithFilepath,
  FactVariant,
  ChangeVariant,
  OpenApiKindToFact,
  isFactVariant,
  isChangeVariant,
  OpenApiRequestFact,
};

export * from './types';
