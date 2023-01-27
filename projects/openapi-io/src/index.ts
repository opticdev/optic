import { inGit, loadSpecFromBranch } from './loaders/file-on-branch';
import { loadSpecFromFile, loadSpecFromUrl } from './loaders/file';
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
import { validateOpenApiV3Document } from './validation/validator';
import { ValidationError } from './validation/errors';
import { checkOpenAPIVersion } from './validation/openapi-versions';
import { filePathToGitPath } from './parser/resolvers/git-branch-file-resolver';
import { jsonPointerLogger } from './validation/log-json-pointer';
import { applyOperationsToYamlString } from './write/yaml-roundtrip';

export { denormalize } from './denormalizers/denormalize';
export {
  applyOperationsToYamlString,
  filePathToGitPath,
  loadSpecFromFile,
  inGit,
  loadSpecFromUrl,
  loadSpecFromBranch,
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
  validateOpenApiV3Document,
  ValidationError,
  checkOpenAPIVersion,
};

export type { JsonPath, ParseOpenAPIResult, ExternalRefHandler };
