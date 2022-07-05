import { promisify } from 'util';
import { exec as callbackExec } from 'child_process';
import pm from 'picomatch';
import { v4 as uuidv4 } from 'uuid';

import { loadFile } from '../utils';

import { UserError } from '@useoptic/openapi-utilities';
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

// Gets the git tree at the `base` branch
const getBaseFiles = async (base: string): Promise<string[]> => {
  const baseFilesStr = await exec(
    'git ls-tree -r --name-only --full-tree ' + base
  );

  return baseFilesStr.stdout.split('\n');
};

// Gets the git tree at the checked out git branch, including unstaged / staged, excluding deleted and gitignored files
const getHeadFiles = async (gitRoot: string): Promise<string[]> => {
  const headFiles = (
    await exec(`git ls-files -co --exclude-standard --full-name ${gitRoot}`)
  ).stdout.split('\n');
  const deletedHeadFilesStdout = (
    await exec(`git ls-files --full-name --deleted ${gitRoot}`)
  ).stdout.split('\n');
  const deletedHeadFiles = new Set(deletedHeadFilesStdout);

  return headFiles.filter((name) => !deletedHeadFiles.has(name));
};

export const getComparisonsFromGlob = async (
  glob: string,
  ignore: string,
  base: string,
  generateContext: (details: { fileName: string }) => Object
): Promise<{
  comparisons: Map<string, Comparison>;
  skippedParsing: boolean;
}> => {
  const globs = glob.split(',').filter((g) => g !== '');
  const ignores = ignore.split(',').filter((s) => s !== '');
  console.log(`Running bulk-compare with globs ${globs.join(' ')}`);
  const gitRoot = await getGitRootPath();
  const baseFiles = await getBaseFiles(base);
  const headFiles = await getHeadFiles(gitRoot);

  const { matchingBaseFiles, matchingHeadFiles } = applyGlobFilters(
    baseFiles,
    headFiles,
    {
      matches: globs,
      ignores: ignores,
    }
  );

  const fileUnion = new Set([...matchingBaseFiles, ...matchingHeadFiles]);

  const comparisons = new Map<string, Comparison>();

  for (const fileName of fileUnion) {
    const absolutePath = path.join(gitRoot, fileName);
    console.log(`Found file ${fileName}`);
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

export const applyGlobFilters = (
  baseFiles: string[],
  headFiles: string[],
  globs: {
    matches: string[];
    ignores: string[];
  }
): {
  matchingBaseFiles: Set<string>;
  matchingHeadFiles: Set<string>;
} => {
  const globMatchers = globs.matches.map((g) => pm(g));
  const ignoreMatchers = globs.ignores.map((i) => pm(i));
  const matchingBaseFiles = new Set(
    baseFiles
      .filter((name) => globMatchers.some((globFilter) => globFilter(name)))
      .filter((name) =>
        ignoreMatchers.every((ignoreFilter) => !ignoreFilter(name))
      )
  );
  const matchingHeadFiles = new Set(
    headFiles
      .filter((name) => globMatchers.some((globFilter) => globFilter(name)))
      .filter((name) =>
        ignoreMatchers.every((ignoreFilter) => !ignoreFilter(name))
      )
  );
  return { matchingBaseFiles, matchingHeadFiles };
};
