import { dump } from 'js-yaml';
import { getFileId } from './get-file-id';
import { SpecWithPath } from './types';

export const generateOpticConfig = (specs: SpecWithPath[]) => ({
  files: specs.map(({ path, spec }) => ({ path, id: getFileId(spec) })),
});

export const generateOpticConfigYml = (specs: SpecWithPath[]): string => {
  const configObject = generateOpticConfig(specs);
  return dump(configObject);
};
