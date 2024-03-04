import {
  JSONParserError,
  parseOpenAPIFromRepoWithSourcemap,
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
  dereferenceOpenApi,
  ResolverError,
} from './parser/openapi-sourcemap-parser';
import { ExternalRefHandler } from './parser/types';
import { JsonPath, JsonSchemaSourcemap } from './parser/sourcemap';
import { loadYaml, isYaml, isJson, writeYaml } from './write';
import {
  validateSwaggerV2Document,
  validateOpenApiV3Document,
} from './validation/validator';
import { ValidationError, OpenAPIVersionError } from './validation/errors';
import {
  checkOpenAPIVersion,
  SupportedOpenAPIVersions,
} from './validation/openapi-versions';
import { filePathToGitPath } from './parser/resolvers/git-branch-file-resolver';
import { jsonPointerLogger } from './validation/log-json-pointer';
import { applyOperationsToYamlString } from './write/yaml-roundtrip';

export {
  denormalize,
  denormalizePaths,
  denormalizeOperation,
} from './denormalizers/denormalize';
export {
  applyOperationsToYamlString,
  filePathToGitPath,
  parseOpenAPIWithSourcemap,
  parseOpenAPIFromRepoWithSourcemap,
  JsonSchemaSourcemap,
  JSONParserError,
  loadYaml,
  jsonPointerLogger,
  isYaml,
  isJson,
  writeYaml,
  dereferenceOpenApi,
  ResolverError,
  validateSwaggerV2Document,
  validateOpenApiV3Document,
  ValidationError,
  OpenAPIVersionError,
  SupportedOpenAPIVersions,
  checkOpenAPIVersion,
};

export type { JsonPath, ParseOpenAPIResult, ExternalRefHandler };
