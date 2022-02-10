import { sourcemapReader } from './parser/sourcemap-reader';
import { inGit, loadSpecFromBranch } from './loaders/file-on-branch';
import { loadSpecFromFile, loadSpecFromUrl } from './loaders/file';
import {
  JsonPath,
  JsonSchemaSourcemap,
  parseOpenAPIFromRepoWithSourcemap,
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from './parser/openapi-sourcemap-parser';
import { loadYaml, isYaml, isJson, writeYaml } from './write/index';
import {
  watchDependencies,
  WatchDependenciesHandler,
} from './loaders/watch-dependencies';

export {
  sourcemapReader,
  loadSpecFromFile,
  inGit,
  loadSpecFromUrl,
  loadSpecFromBranch,
  parseOpenAPIWithSourcemap,
  parseOpenAPIFromRepoWithSourcemap,
  JsonSchemaSourcemap,
  loadYaml,
  isYaml,
  isJson,
  writeYaml,
  watchDependencies,
  WatchDependenciesHandler,
};

export type { JsonPath, ParseOpenAPIResult };
