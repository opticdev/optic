import { ono } from '@jsdevtools/ono';
import { ResolverError } from '@apidevtools/json-schema-ref-parser';
const url = require('@apidevtools/json-schema-ref-parser/lib/util/url');

import path from 'upath';
import { exec } from 'child_process';

import { ExternalRefHandler } from '../types';

export const gitBranchResolver = (
  gitBaseRepo: string,
  branch: string
): ExternalRefHandler => ({
  order: 1,
  canRead(file) {
    return url.isFileSystemPath(file.url);
  },
  read(file) {
    return new Promise((resolve, reject) => {
      // We need to decode the git path, because we receive the file path / url as a URL encoded string
      const decodedFilePath = decodeURIComponent(file.url);
      const toGit = filePathToGitPath(gitBaseRepo, decodedFilePath);
      const command = `git show "${branch}:${toGit}"`;
      try {
        exec(
          command,
          { cwd: gitBaseRepo, maxBuffer: 1024 * 1024 * 100 },
          (err, stdout, stderr) => {
            if (err)
              reject(
                new ResolverError(
                  ono(err.message, `Error opening file "${toGit}"`),
                  toGit
                )
              );
            if (stdout) resolve(stdout);
          }
        );
      } catch (err) {
        reject(
          new ResolverError(
            ono(err as any, `Error opening file "${toGit}"`),
            toGit
          )
        );
      }
    });
  },
});

export function filePathToGitPath(
  gitBaseRepo: string,
  filePath: string
): string {
  const toGit = path.relative(gitBaseRepo, filePath);
  return path.toUnix(toGit);
}
