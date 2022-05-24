import path from 'path';

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
