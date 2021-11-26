import { IFilePatch } from '../../../services/patch/types';
import * as Diff from 'diff';
import os from 'os';
import chalk from 'chalk';
import sortby from 'lodash.sortby';

export type DiffBetweenSpecs = { hunk: string[]; path: string; line: number }[];

export function showDiffBetweenSpecs({ files }: IFilePatch): DiffBetweenSpecs {
  const hunks: DiffBetweenSpecs = files.flatMap(
    ({ previousContents, newContents, path }) => {
      return Diff.structuredPatch(
        '',
        '',
        previousContents,
        newContents
      ).hunks.map((hunk) => {
        const linesOutput = hunk.lines.map((i) => {
          if (i[0] === '+') {
            return chalk.green.bold(i);
          } else if (i[0] === '-') {
            return chalk.red.bold(i);
          } else {
            return i;
          }
        });
        return { hunk: linesOutput, path, line: hunk.oldStart };
      });
    }
  );

  return sortby(hunks, ['path', 'line']);
}
