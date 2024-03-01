import { OpticCliConfig, VCS } from '../config';
import { Command } from 'commander';
import { errorHandler } from '../error-handler';
import { logger } from '../logger';
import chalk from 'chalk';
import * as GitCandidates from './api/git-get-file-candidates';
import fs from 'fs';
import path from 'path';
import { ParseResult, loadSpec } from '../utils/spec-loaders';
import stableStringify from 'json-stable-stringify';
import { computeChecksumForAws } from '../utils/checksum';
import { compareSpecs } from '@useoptic/openapi-utilities';
import { RuleRunner } from '@useoptic/rulesets-base';
import { BreakingChangesRuleset } from '@useoptic/standard-rulesets';
import { exec } from 'child_process';
import { getEndpointsChanges } from '@useoptic/openapi-utilities';

const usage = () => `
  optic history [path_to_spec]`;

const helpText = `
Example usage:
  Export api history to changelog.md file
  $ optic history <path_to_spec.yml> > changelog.md`;

function short(sha: string) {
  return sha.slice(0, 8);
}

export const registerHistory = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('history')
    .configureHelp({ commandUsage: usage })
    .addHelpText('after', helpText)
    .description('Browse spec history and create a text changelog')
    .argument('[path_to_spec]', 'Path to OpenAPI file')
    .option(
      '-D, --history-depth <history-depth>',
      'Sets the depth of how far to crawl through to historic API data. history-depth=0 will crawl the entire history',
      '0'
    )
    .action(errorHandler(getHistoryAction(config), { command: 'history' }));
};

type HistoryOptions = {
  historyDepth: string;
};

type CommitInfo = {
  commitDate: Date;
};

const getCommitInfo = (sha: string): Promise<CommitInfo> => {
  return new Promise((resolve, reject) => {
    exec(`git show --format="%cd" ${sha} -s`, (error, stdout, stderr) => {
      if (error || stderr) reject(error || stderr);
      resolve({
        commitDate: new Date(stdout),
      });
    });
  });
};

const isSameDay = (date1?: Date, date2?: Date) => {
  if (!date1 || !date2) return false;
  const utcDate1 = Date.UTC(
    date1.getUTCFullYear(),
    date1.getUTCMonth(),
    date1.getUTCDate()
  );
  const utcDate2 = Date.UTC(
    date2.getUTCFullYear(),
    date2.getUTCMonth(),
    date2.getUTCDate()
  );
  return utcDate1 == utcDate2;
};

const logDiffs = async (
  baseSpec: ParseResult,
  headSpec: ParseResult,
  headDate?: Date
): Promise<boolean> => {
  if (baseSpec.version === '2.x.x' || headSpec.version === '2.x.x') {
    if (headSpec.version === '2.x.x')
      logger.warn(
        `skipping: ${headDate?.toDateString()} - swagger 2.0 specs are not supported`
      );

    return false;
  }
  const rulesRunner = new RuleRunner([new BreakingChangesRuleset()]);
  const comparison = await compareSpecs(baseSpec, headSpec, rulesRunner, {});
  let hasChanges = false;
  for (const { method, path, changes } of getEndpointsChanges(
    baseSpec.jsonLike,
    headSpec.jsonLike,
    comparison.diffs
  )) {
    if (!hasChanges) {
      console.log(`### ${headDate?.toDateString()}`);
      hasChanges = true;
    }
    if (changes.size > 1) {
      console.log(`- \`${method.toUpperCase()}\` \`${path}\`:`);
      for (const change of changes) {
        console.log(`  - ${change}`);
      }
    } else {
      const change = changes[Symbol.iterator]().next()?.value;
      const addedOrRemoved = change === 'added' || change === 'removed';
      const suffix = addedOrRemoved ? `` : `: ${change}`;
      const prefix = addedOrRemoved ? `${change} ` : '';
      console.log(
        `- ${prefix}\`${method.toUpperCase()}\` \`${path}\`${suffix}`
      );
    }
  }
  return hasChanges;
};

export const getHistoryAction =
  (config: OpticCliConfig) =>
  async (path_to_spec: string | undefined, options: HistoryOptions) => {
    if (config.vcs?.type !== VCS.Git) {
      logger.error(
        chalk.red(
          'the history command must be called from inside a git repository'
        )
      );
      process.exitCode = 1;
      return;
    }

    if (!path_to_spec) {
      logger.error(chalk.red('path_to_spec is undefined.'));
      process.exitCode = 1;
      return;
    }

    const absolutePath = path.resolve(path_to_spec);
    if (!absolutePath.startsWith(config.root)) {
      logger.error(
        chalk.red('path_to_spec must belong to the current git repository')
      );
      process.exitCode = 1;
      return;
    }

    const stats = fs.statSync(path_to_spec, { throwIfNoEntry: false });
    const isFile = stats?.isFile();
    if (!isFile) {
      logger.error(
        chalk.red('path_to_spec is not a valid specification file path')
      );
      process.exitCode = 1;
      return;
    }

    if (isNaN(Number(options.historyDepth))) {
      logger.error(
        chalk.red(
          '--history-depth, -D is not a number. history-depth must be a number'
        )
      );
      process.exitCode = 1;
      return;
    }

    const candidates = await GitCandidates.getShasCandidatesForPath(
      path_to_spec,
      options.historyDepth
    );

    const shaPaths = await GitCandidates.followFile(
      path_to_spec,
      options.historyDepth
    );
    let nextShaPathIndex = 0;

    const pathRelativeToRoot = path.relative(config.root, absolutePath);

    let headChecksum: string | undefined = undefined;
    let headSpec: ParseResult | undefined = undefined;
    let headDate: Date | undefined = undefined;
    let hasAnyChange = false;

    for (const [ix, baseSha] of candidates.shas.entries()) {
      let baseSpec: ParseResult;
      const path = shaPaths[nextShaPathIndex]?.[1] ?? pathRelativeToRoot;

      const shaPathIndex = shaPaths.findIndex((p) => p[0] === baseSha);
      if (shaPathIndex > -1)
        nextShaPathIndex = Math.min(nextShaPathIndex + 1, shaPaths.length - 1);

      try {
        baseSpec = await loadSpec(`${baseSha}:${path}`, config, {
          strict: false,
          denormalize: true,
        });
      } catch (e) {
        logger.debug(
          `${short(
            baseSha
          )}:${pathRelativeToRoot} is not a valid OpenAPI file, skipping sha version`,
          e
        );
        continue;
      }
      const stableSpecString = stableStringify(baseSpec.jsonLike);
      const baseChecksum = computeChecksumForAws(stableSpecString);
      const { commitDate: baseDate } = await getCommitInfo(baseSha);
      const sameDay = isSameDay(headDate, baseDate);
      const sameChecksum = baseChecksum === headChecksum;
      const lastCandidate = ix === candidates.shas.length - 1;

      if (lastCandidate && !sameChecksum && headSpec) {
        const hasChange = await logDiffs(baseSpec, headSpec, headDate);
        if (hasChange) hasAnyChange = true;
        continue;
      }

      if (sameChecksum) continue;

      if (!headSpec) {
        headSpec = baseSpec;
        headDate = baseDate;
        const title = baseSpec.jsonLike.info.title;
        console.log(`# ${title}`);
        continue;
      }

      if (sameDay) continue;

      const hasChange = await logDiffs(baseSpec, headSpec, headDate);
      if (hasChange) hasAnyChange = true;

      headChecksum = baseChecksum;
      headDate = baseDate;
      headSpec = baseSpec;
    }

    if (!hasAnyChange) console.log('No changes found');
  };
