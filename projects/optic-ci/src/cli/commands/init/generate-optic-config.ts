import path from 'path';
import { getFileId } from './get-file-id';
import { SpecWithPath } from './types';

const getFileName = (filePath: string) =>
  (path.basename(filePath) || 'openapi').replace(/\s/g, '-');

export const generateOpticConfig = (specs: SpecWithPath[]) => ({
  files: specs.map(({ path, spec }) => ({
    path,
    id: getFileId(spec, getFileName(path)),
  })),
});
