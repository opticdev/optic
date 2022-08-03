import path from 'path';
import { promisify } from 'util';
import { exec as callbackExec } from 'child_process';
const exec = promisify(callbackExec);

export const getRelativeRepoPath = (
  relativePath: string,
  gitRootPath: string | false
): string => {
  const absolutePath = path.join(process.cwd(), relativePath);

  if (!gitRootPath) {
    return absolutePath;
  } else {
    return absolutePath.startsWith(gitRootPath)
      ? absolutePath.replace(gitRootPath, '')
      : absolutePath;
  }
};

export const getGitRootPath = async () => {
  const { stdout: gitRootUntrimmed } = await exec(
    'git rev-parse --show-toplevel'
  );
  const gitRoot = gitRootUntrimmed.trim();
  return gitRoot;
};
