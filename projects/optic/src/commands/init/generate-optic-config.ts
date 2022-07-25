import path from 'path';
import { ValidSpec } from './get-valid-specs';
import { SpecWithPath } from './types';

type ConfigFile = {
  path: string;
  id: string;
};

const getFileName = (filePath: string) => path.basename(filePath) || 'openapi';

const getFileId = ({ title, path }: ValidSpec) =>
  (title || getFileName(path)).replace(/\s/g, '-');

const getIncrementalFileId = (fileId: string, i: number) => `${fileId}-${i}`;

export const generateOpticConfig = (specs: ValidSpec[], gitRoot: string) => {
  let files: ConfigFile[] = [];
  const fileIds = new Set<string>();

  for (const spec of specs) {
    const fileId = getFileId(spec);

    let i = 1;
    let incrementalFileId = fileId;

    while (fileIds.has(incrementalFileId)) {
      incrementalFileId = getIncrementalFileId(fileId, i);
      i++;
    }

    fileIds.add(incrementalFileId);

    const file = {
      path: path.relative(gitRoot, spec.path),
      id: incrementalFileId,
    };

    files.push(file);
  }

  return { files, ruleset: ['breaking-changes'] };
};
