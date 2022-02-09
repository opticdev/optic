import { SpecLoaderResult } from './types';
import * as path from 'path';
import {
  JsonSchemaSourcemap,
  parseOpenAPIFromRepoWithSourcemap,
} from '../parser/openapi-sourcemap-parser';

const util = require('util');
const exec = util.promisify(require('child_process').exec);

export async function loadSpecFromBranch(
  fileNameInRepo: string,
  repoPath: string,
  branch: string,
  defaultValue: any,
  includeSourcemap: boolean = true
): Promise<SpecLoaderResult> {
  try {
    const results = await parseOpenAPIFromRepoWithSourcemap(
      fileNameInRepo,
      repoPath,
      branch
    );
    return {
      success: true,
      flattened: results.jsonLike,
      sourcemap: includeSourcemap
        ? results.sourcemap
        : new JsonSchemaSourcemap(fileNameInRepo),
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// helpers
export async function inGit(workingDirectory: string): Promise<false | string> {
  try {
    const { stdout } = await exec('git rev-parse --show-toplevel', {
      cwd: workingDirectory,
    });
    return stdout.trim();
  } catch (e) {
    return false;
  }
}
