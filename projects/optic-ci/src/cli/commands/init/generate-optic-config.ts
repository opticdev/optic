import path from 'path';
import { getFileId } from './get-file-id';
import { SpecWithPath } from './types';

const getFileName = (filePath: string) =>
  (path.basename(filePath) || 'openapi').replace(/\s/g, '-');

const generateOpticConfigFile = (
  { spec, path: filePath }: SpecWithPath,
  gitRoot: string
) => {
  const relativePath = path.relative(gitRoot, filePath);
  return {
    path: relativePath,
    id: getFileId(spec, getFileName(filePath)),
  };
};

export const generateOpticConfig = (
  specs: SpecWithPath[],
  gitRoot: string
) => ({
  files: specs.map((spec) => generateOpticConfigFile(spec, gitRoot)),
});
