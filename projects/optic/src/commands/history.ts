import { OpticCliConfig, VCS } from '../config';
import { Command } from 'commander';
import { errorHandler } from '../error-handler';
import { logger } from '../logger';
import chalk from 'chalk';
import * as GitCandidates from './api/git-get-file-candidates';
import fs from 'fs';
import path from 'path';
import { loadSpec } from '../utils/spec-loaders';
import stableStringify from 'json-stable-stringify';
import { computeChecksumForAws } from '../utils/checksum';
import { compareSpecs, ObjectDiff } from '@useoptic/openapi-utilities';
import { RuleRunner } from '@useoptic/rulesets-base';
import { BreakingChangesRuleset } from '@useoptic/standard-rulesets';
import { OpenAPIV3 } from 'openapi-types';
import { HttpMethods } from './oas/operations';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { exec } from 'child_process';

const usage = () => `
  optic history <path_to_spec.yml>`;

const helpText = `
Example usage:
  Export api history to changelog.md file
  $ optic history <path_to_spec.yml> > changelog.md`;

export const registerHistory = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('history')
    .configureHelp({ commandUsage: usage })
    .addHelpText('after', helpText)
    .description('Browse spec history and create a text changelog')
    .argument('[path_to_spec]', 'path to OpenAPI file')
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

const logDiffs = async (baseSpec: any, headSpec: any, headDate?: Date) => {
  const rulesRunner = new RuleRunner([new BreakingChangesRuleset()]);
  const comparison = await compareSpecs(baseSpec, headSpec, rulesRunner, {});
  console.log(`### ${headDate?.toDateString()}`);
  logEndpointsChanges(baseSpec.jsonLike, headSpec.jsonLike, comparison.diffs);
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

    const pathRelativeToRoot = path.relative(config.root, absolutePath);

    let headChecksum: string | undefined = undefined;
    let headSpec: any;
    let headDate: Date | undefined = undefined;

    for (const [ix, baseSha] of candidates.shas.entries()) {
      const baseSpec = await loadSpec(
        `${baseSha}:${pathRelativeToRoot}`,
        config,
        {
          strict: false,
          denormalize: true,
        }
      );
      const stableSpecString = stableStringify(baseSpec.jsonLike);
      const baseChecksum = computeChecksumForAws(stableSpecString);
      const { commitDate: baseDate } = await getCommitInfo(baseSha);
      const sameDay = isSameDay(headDate, baseDate);
      const sameChecksum = baseChecksum === headChecksum;
      const lastCandidate = ix === candidates.shas.length - 1;

      if (lastCandidate && !sameChecksum) {
        await logDiffs(baseSpec, headSpec, headDate);
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

      await logDiffs(baseSpec, headSpec, headDate);

      headChecksum = baseChecksum;
      headDate = baseDate;
      headSpec = baseSpec;
    }
  };

const getChangeType = (diff: ObjectDiff) => {
  return diff.after && diff.before
    ? 'changed'
    : diff.after
    ? 'added'
    : 'removed';
};

const isPathChange = (segments: string[]) => segments[0] === 'paths';

const isPathExactChange = (segments: string[]) =>
  isPathChange(segments) && segments.length === 2;

const isMethodChange = (segments: string[]) =>
  isPathChange(segments) &&
  segments.length >= 3 &&
  segments[2].toUpperCase() in HttpMethods;

const isMethodExactChange = (segments: string[]) =>
  isMethodChange(segments) && segments.length === 3;

const isRequestChange = (segments: string[]) =>
  isMethodChange(segments) && segments[3] === 'requestBody';

const isResponseChange = (segments: string[]) =>
  isMethodChange(segments) && segments[3] === 'responses';

const isMethodParameterChange = (segments: string[]) =>
  isMethodChange(segments) && segments[3] === 'parameters';

const getParameterValue = (segements: string[], spec: OpenAPIV3.Document) => {
  return jsonPointerHelpers.get(spec, segements);
};

const logEndpointsChanges = (
  baseSpec: OpenAPIV3.Document,
  headSpec: OpenAPIV3.Document,
  diffs: ObjectDiff[]
) => {
  const paths = new Map<string, Map<string, Set<string>>>();

  const getChangeDescription = (segments: string[]) => {
    const parentSegment = segments[segments.length - 2];
    const qualifier = parentSegment === 'properties' ? ' property' : '';
    let outPaths = segments.filter(
      (s) => ['schema', 'properties', 'content', 'paths'].indexOf(s) < 0
    );
    return outPaths.map((s) => `\`${s}\``).join('.') + `${qualifier}`;
  };

  const getParameterChange = (segments: string[], changeType: string) => {
    const param = getParameterValue(
      segments.slice(0, 5),
      changeType === 'removed' ? baseSpec : headSpec
    );
    return changeType === 'added' || changeType === 'removed'
      ? `${changeType} \`${param?.name}\` ${param?.in} parameter`
      : `${changeType} \`${param?.name}\` ${
          param?.in
        } parameter ${getChangeDescription(segments.slice(5))}`;
  };

  const getRequestBodyChange = (segments: string[], changeType: string) => {
    return `${changeType} \`requestBody\` ${getChangeDescription(
      segments.slice(6)
    )}`;
  };

  const getResponseChange = (segments: string[], changeType: string) => {
    return `${changeType} \`${segments[4]}\` response ${getChangeDescription(
      segments.slice(7)
    )}`;
  };

  const getChange = (segments: string[], changeType: string) => {
    return isRequestChange(segments)
      ? getRequestBodyChange(segments, changeType)
      : isResponseChange(segments)
      ? getResponseChange(segments, changeType)
      : isMethodParameterChange(segments)
      ? getParameterChange(segments, changeType)
      : isMethodExactChange(segments)
      ? `${changeType}`
      : '';
  };

  for (const diff of diffs) {
    const changeType = getChangeType(diff);
    const segments =
      changeType === 'removed'
        ? jsonPointerHelpers.decode(diff.before!)
        : jsonPointerHelpers.decode(diff.after!);

    if (isPathExactChange(segments)) {
      const path = jsonPointerHelpers.get(
        changeType === 'removed' ? baseSpec : headSpec,
        segments
      );
      const methods: string[] = [];
      for (const method in HttpMethods) {
        if (method.toLowerCase() in path) {
          methods.push(method);
        }
      }
      for (const method of methods) {
        diffs.push({
          ...diff,
          ...(diff.before ? { before: diff.before + `/${method}` } : {}),
          ...(diff.after ? { after: diff.after + `/${method}` } : {}),
        } as any);
      }
      continue;
    }

    if (!isMethodChange(segments)) continue;

    const [, path, method] = segments;

    if (!paths.get(path)) paths.set(path, new Map());
    const prevPath = paths.get(path)!;
    const prevMethod = prevPath.get(method) ?? new Set();

    const change = getChange(segments, changeType);
    if (change) prevMethod.add(change);
    prevPath.set(method, prevMethod);
  }

  for (const [path, methods] of paths.entries()) {
    for (const [method, changes] of methods.entries()) {
      if (!changes.size) continue;
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
  }
};
