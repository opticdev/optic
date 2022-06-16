import { promisify } from 'util';
import { exec as callbackExec } from 'child_process';
import pm from 'picomatch';
import { v4 as uuidv4 } from 'uuid';

import { loadFile } from '../utils';

import { UserError } from '../../errors';
import { Comparison } from './types';
import path from 'path';
import { getGitRootPath } from '../utils/path';

const exec = promisify(callbackExec);

export const parseJsonComparisonInput = async (
  input: string,
  generateContext: (details: { fileName: string }) => Object
): Promise<{
  comparisons: Map<string, Comparison>;
  skippedParsing: boolean;
}> => {
  try {
    console.log('Reading input file...');
    const fileOutput = await loadFile(input);
    let skippedParsing = false;
    const output = JSON.parse(fileOutput.toString());
    const initialComparisons: Map<string, Comparison> = new Map();
    for (const comparison of output.comparisons || []) {
      if (!comparison.from && !comparison.to) {
        throw new Error('Cannot specify a comparison with no from or to files');
      }
      const id = uuidv4();

      initialComparisons.set(id, {
        id,
        fromFileName: comparison.from,
        toFileName: comparison.to,
        context:
          comparison.context ||
          generateContext({
            fileName: comparison.to || comparison.from || '',
          }),
        loading: true,
      });
    }

    return { comparisons: initialComparisons, skippedParsing };
  } catch (e) {
    console.error(e);
    throw new UserError();
  }
};

export const getComparisonsFromGlob = async (
  glob: string,
  base: string,
  generateContext: (details: { fileName: string }) => Object
): Promise<{
  comparisons: Map<string, Comparison>;
  skippedParsing: boolean;
}> => {
  console.log(`Running bulk-compare with glob ${glob}`);
  const gitRoot = await getGitRootPath();
  // Gets the git tree at the `base` branch
  const { stdout: baseFiles } = await exec(
    'git ls-tree -r --name-only --full-tree ' + base
  );
  // Gets the git tree at the checked out git branch, including unstaged / staged, excluding deleted and gitignored files
  const { stdout: headFiles } = await exec(
    `git ls-files -co --exclude-standard --full-name ${gitRoot}`
  );
  const { stdout: deletedHeadFilesStdout } = await exec(
    `git ls-files --full-name --deleted ${gitRoot}`
  );

  const filterByGlob = pm(glob);
  const deletedHeadFiles = new Set(deletedHeadFilesStdout.split('\n'));
  const matchingBaseFiles = new Set(
    baseFiles.split('\n').filter((name) => filterByGlob(name))
  );
  const matchingHeadFiles = new Set(
    headFiles
      .split('\n')
      .filter((name) => filterByGlob(name) && !deletedHeadFiles.has(name))
  );
  const fileUnion = new Set([...matchingBaseFiles, ...matchingHeadFiles]);

  const comparisons = new Map<string, Comparison>();

  for (const fileName of fileUnion) {
    const absolutePath = path.join(gitRoot, fileName);
    console.log(`Found file ${fileName} matching ${glob}`);
    const id = uuidv4();
    comparisons.set(id, {
      id,
      fromFileName: matchingBaseFiles.has(fileName)
        ? `${base}:${fileName}`
        : undefined,
      toFileName: matchingHeadFiles.has(fileName) ? absolutePath : undefined,
      context: generateContext({
        fileName: fileName,
      }),
      loading: true,
    });
  }

  return {
    comparisons,
    skippedParsing: false,
  };
};
