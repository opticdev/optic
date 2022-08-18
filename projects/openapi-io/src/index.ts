import { inGit, loadSpecFromBranch } from './loaders/file-on-branch';
import { loadSpecFromFile, loadSpecFromUrl } from './loaders/file';
import {
  JSONParserError,
  parseOpenAPIFromRepoWithSourcemap,
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
  parseOpenAPIFromGithub,
} from './parser/openapi-sourcemap-parser';
import {
  JsonPath,
  JsonSchemaSourcemap,
  resolveJsonPointerInYamlAst,
} from './parser/sourcemap';
import { loadYaml, isYaml, isJson, writeYaml } from './write/index';
import {
  watchDependencies,
  WatchDependenciesHandler,
} from './loaders/watch-dependencies';
import { collectFilePatchesFromInMemoryUpdates } from './roundtrip/reconciler';

export {
  loadSpecFromFile,
  inGit,
  loadSpecFromUrl,
  loadSpecFromBranch,
  parseOpenAPIWithSourcemap,
  parseOpenAPIFromGithub,
  parseOpenAPIFromRepoWithSourcemap,
  resolveJsonPointerInYamlAst,
  JsonSchemaSourcemap,
  JSONParserError,
  loadYaml,
  isYaml,
  isJson,
  writeYaml,
  watchDependencies,
  WatchDependenciesHandler,
  collectFilePatchesFromInMemoryUpdates,
};

export type { JsonPath, ParseOpenAPIResult };
