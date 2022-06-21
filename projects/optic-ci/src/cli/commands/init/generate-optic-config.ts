import { dump } from 'js-yaml';
import { getFileId } from './get-file-id';

export const generateOpticConfig = (filePaths: string[]) => ({
  files: filePaths.map((p) => ({ path: p, id: getFileId(p) })),
});

export const generateOpticConfigYml = (files: string[]): string => {
  const configObject = generateOpticConfig(files);
  return dump(configObject);
};
