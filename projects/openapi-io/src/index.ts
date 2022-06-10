import { inGit, loadSpecFromBranch } from './loaders/file-on-branch';
import { loadSpecFromFile, loadSpecFromUrl } from './loaders/file';
import {
  JsonPath,
  JsonSchemaSourcemap,
  dereferenceOpenAPI,
  parseOpenAPIFromRepoWithSourcemap,
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from './parser/openapi-sourcemap-parser';
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
  parseOpenAPIFromRepoWithSourcemap,
  dereferenceOpenAPI,
  JsonSchemaSourcemap,
  loadYaml,
  isYaml,
  isJson,
  writeYaml,
  watchDependencies,
  WatchDependenciesHandler,
  collectFilePatchesFromInMemoryUpdates,
};

export type { JsonPath, ParseOpenAPIResult };
