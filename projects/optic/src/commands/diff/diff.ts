import { Command, Option } from 'commander';
import {
  GetSourcemapOptions,
  UserError,
  textToSev,
} from '@useoptic/openapi-utilities';

import {
  parseFilesFromRef,
  ParseResult,
  loadSpec,
  parseFilesFromCloud,
} from '../../utils/spec-loaders';
import { ConfigRuleset, OpticCliConfig, VCS } from '../../config';
import chalk from 'chalk';
import { flushEvents, trackEvent } from '../../segment';
import { terminalChangelog } from './changelog-renderers/terminal-changelog';
import { jsonChangelog } from './changelog-renderers/json-changelog';
import { compute } from './compute';
import { compressDataV2 } from './compressResults';
import { uploadDiff } from './upload-diff';
import { writeDataForCi } from '../../utils/ci-data';
import { logger } from '../../logger';
import { errorHandler } from '../../error-handler';
import path from 'path';
import { OPTIC_URL_KEY } from '../../constants';
import { getApiFromOpticUrl, getOpticUrlDetails } from '../../utils/cloud-urls';
import * as Git from '../../utils/git-utils';
import * as GitCandidates from '../api/git-get-file-candidates';
import stableStringify from 'json-stable-stringify';
import { computeChecksumForAws } from '../../utils/checksum';
import { openUrl } from '../../utils/open-url';
import { renderCloudSetup } from '../../utils/render-cloud';
import { getSpinner } from '../../utils/spinner';

type DiffActionOptions = {
  base: string;
  check: boolean;
  web: boolean;
  upload: boolean;
  json: boolean;
  standard?: string;
  ruleset?: string;
  headTag?: string;
  validation: 'strict' | 'loose';
  severity: 'info' | 'warn' | 'error';
  lastChange: boolean;
  generated?: boolean;
};

const description = 'Run a diff between two API specs';

const usage = () => `
  optic diff [file] --base <base>
  optic diff [file1] [file2]
  optic diff [file1] [file2] --check`;

const helpText = `
Examples:
  Diff \`specs/openapi-spec.yml\` against master
  $ optic diff openapi-spec.yml --base master

  Diff \`openapi-spec-v0.yml\` against \`openapi-spec-v1.yml\`
  $ optic diff openapi-spec-v0.yml openapi-spec-v1.yml

  Run a diff and check the changes against the detected standard (looks at --standard, then 'x-optic-standard' in the spec, then the optic.dev.yml file)):
  $ optic diff openapi-spec-v0.yml openapi-spec-v1.yml --check

  Specify a different standard config to run against
  $ optic diff openapi-spec-v0.yml openapi-spec-v1.yml --check --standard ./other_config.yml
  `;

export const registerDiff = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('diff')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description(description)
    .argument('[file1]', 'Path to file to compare with')
    .argument('[file2]', 'Path to file to compare')
    .addOption(
      new Option(
        '-b, --base <base>',
        'The base ref to compare against, also supports optic cloud tags (cloud:tag_name)'
      ).default('HEAD')
    )
    .option(
      '-S, --standard <standard>',
      'Run comparison with a locally defined standard, if not set, looks for the standard on the [x-optic-standard] key in the spec and then the optic.dev.yml file'
    )
    .option(
      '-H, --head-tag <head-tag>',
      'Adds additional tags to the HEAD spec, used in conjunction with `--upload`'
    )
    .addOption(new Option('--ruleset <ruleset>', '').hideHelp())
    .addOption(
      new Option(
        '-s, --severity <severity>',
        'Specify the severity level to exit with exit code: info=0, warn=1, error=2'
      )
        .choices(['info', 'warn', 'error'])
        .default('error')
    )
    .addOption(
      new Option(
        '-v, --validation <validation>',
        'Specify the level of validation to run'
      )
        .choices(['strict', 'loose'])
        .default('strict')
    )
    .option('-c, --check', 'Enable checks', false)
    .option('-u, --upload', 'Upload run to cloud', false)
    .option('-w, --web', 'View the diff in the Optic changelog web view', false)
    .option('--json', 'Output as json', false)
    .option('--last-change', 'Find the last change for this spec', false)
    .option(
      '--generated',
      '[deprecated] Optic no longer differentiates generated and non-generated specifications'
    )
    .action(errorHandler(getDiffAction(config), { command: 'diff' }));
};

type SpecDetails = { apiId: string; orgId: string } | null;

const getHeadAndLastChanged = async (
  file: string,
  config: OpticCliConfig,
  options: DiffActionOptions
): Promise<{
  meta: { sha: string | null };
  specs: [ParseResult, ParseResult, SpecDetails];
}> => {
  try {
    const absolutePath = path.resolve(file);
    const pathRelativeToRoot = path.relative(config.root, absolutePath);
    let shaWithChange: string | null = null;
    let baseFile = await loadSpec('null:', config, {
      strict: false,
      denormalize: true,
    });
    const headFile = await loadSpec(file, config, {
      strict: options.validation === 'strict',
      denormalize: true,
    });
    const stableSpecString = stableStringify(headFile.jsonLike);
    const headChecksum = computeChecksumForAws(stableSpecString);

    const candidates = await GitCandidates.getShasCandidatesForPath(file, '0');
    for (const sha of candidates.shas) {
      const baseFileForSha = await loadSpec(
        `${sha}:${pathRelativeToRoot}`,
        config,
        {
          strict: false,
          denormalize: true,
        }
      );
      const stableSpecString = stableStringify(baseFileForSha.jsonLike);
      const baseChecksum = computeChecksumForAws(stableSpecString);
      if (baseChecksum !== headChecksum) {
        shaWithChange = sha;
        baseFile = baseFileForSha;
        break;
      }
    }

    const opticUrl =
      headFile.jsonLike[OPTIC_URL_KEY] ??
      baseFile.jsonLike[OPTIC_URL_KEY] ??
      undefined;

    const specDetails = await getOpticUrlDetails(config, {
      filePath: path.relative(config.root, path.resolve(file)),
      opticUrl,
    });

    return {
      specs: [baseFile, headFile, specDetails],
      meta: { sha: shaWithChange },
    };
  } catch (e) {
    throw new UserError({
      initialError: e instanceof Error ? e : undefined,
    });
  }
};

const getBaseAndHeadFromFiles = async (
  file1: string,
  file2: string,
  config: OpticCliConfig,
  options: DiffActionOptions
): Promise<[ParseResult, ParseResult, SpecDetails]> => {
  try {
    const [baseFile, headFile] = await Promise.all([
      loadSpec(file1, config, {
        strict: options.validation === 'strict',
        denormalize: true,
      }),
      loadSpec(file2, config, {
        strict: options.validation === 'strict',
        denormalize: true,
      }),
    ]);
    const opticUrl: string | null =
      headFile.jsonLike[OPTIC_URL_KEY] ??
      baseFile.jsonLike[OPTIC_URL_KEY] ??
      null;
    const specDetails = opticUrl ? getApiFromOpticUrl(opticUrl) : null;
    return [baseFile, headFile, specDetails];
  } catch (e) {
    throw new UserError({
      initialError: e instanceof Error ? e : undefined,
    });
  }
};

const getBaseAndHeadFromFileAndBase = async (
  file1: string,
  base: string,
  root: string,
  config: OpticCliConfig,
  options: DiffActionOptions
): Promise<[ParseResult, ParseResult, SpecDetails]> => {
  try {
    if (/^cloud:/.test(base)) {
      const { baseFile, headFile, specDetails } = await parseFilesFromCloud(
        file1,
        base.replace(/^cloud:/, ''),
        config,
        {
          denormalize: true,
          headStrict: options.validation === 'strict',
        }
      );
      return [baseFile, headFile, specDetails];
    } else {
      const { baseFile, headFile } = await parseFilesFromRef(
        file1,
        base,
        root,
        config,
        {
          denormalize: true,
          headStrict: options.validation === 'strict',
        }
      );
      const opticUrl: string | null =
        headFile.jsonLike[OPTIC_URL_KEY] ??
        baseFile.jsonLike[OPTIC_URL_KEY] ??
        null;
      const specDetails = opticUrl ? getApiFromOpticUrl(opticUrl) : null;
      return [baseFile, headFile, specDetails];
    }
  } catch (e) {
    throw new UserError({
      initialError: e instanceof Error ? e : undefined,
    });
  }
};

const runDiff = async (
  [baseFile, headFile]: [ParseResult, ParseResult, SpecDetails],
  config: OpticCliConfig,
  options: DiffActionOptions,
  filepath: string
): Promise<{
  checks: Awaited<ReturnType<typeof compute>>['checks'];
  specResults: Awaited<ReturnType<typeof compute>>['specResults'];
  changelogData: Awaited<ReturnType<typeof compute>>['changelogData'];
  warnings: string[];
  standard: ConfigRuleset[];
}> => {
  const { specResults, checks, changelogData, warnings, standard } =
    await compute([baseFile, headFile], config, { ...options, path: filepath });

  return {
    checks,
    specResults,
    changelogData,
    warnings,
    standard,
  };
};

const getDiffAction =
  (config: OpticCliConfig) =>
  async (
    file1: string | undefined,
    file2: string | undefined,
    options: DiffActionOptions
  ) => {
    if (options.generated) {
      logger.warn(
        chalk.yellow.bold(
          `the --generated option is deprecated, diff works without the --generated option`
        )
      );
    }
    if (options.json) {
      // For json output we only want to render json
      logger.setLevel('silent');
    }
    if (options.upload && !config.isAuthenticated) {
      logger.error(
        chalk.bold.red(
          'Error: Must be logged in to upload results. Run optic login to authenticate.'
        )
      );
      return;
    }

    if (options.ruleset && !options.standard) {
      options.standard = options.ruleset;
    }
    let parsedFiles: [ParseResult, ParseResult, SpecDetails];
    if (file1 && options.lastChange) {
      if (config.vcs?.type !== VCS.Git) {
        const commandVariant = `optic diff <file> --last-change`;
        logger.error(
          `Error: ${commandVariant} must be called from a git repository.`
        );
        process.exitCode = 1;
        return;
      }
      const spinner = getSpinner({
        text: `Finding last change...`,
        color: 'blue',
      });
      spinner?.start();

      const {
        meta: { sha },
        specs,
      } = await getHeadAndLastChanged(file1, config, options);
      parsedFiles = specs;

      spinner?.succeed(
        sha
          ? `Found last change at ${sha}`
          : 'No changes found, comparing against an empty spec'
      );
    } else if (file1 && file2) {
      parsedFiles = await getBaseAndHeadFromFiles(
        file1,
        file2,
        config,
        options
      );
    } else if (file1) {
      if (config.vcs?.type !== VCS.Git) {
        const commandVariant = `optic diff <file> --base <ref>`;
        logger.error(
          `Error: ${commandVariant} must be called from a git repository.`
        );
        process.exitCode = 1;
        return;
      }
      parsedFiles = await getBaseAndHeadFromFileAndBase(
        file1,
        options.base,
        config.root,
        config,
        options
      );
    } else {
      logger.error(
        'Command removed: optic diff (no args) has been removed, please use optic diff <file_path> --base <base> instead'
      );
      process.exitCode = 1;
      return;
    }

    const diffResult = await runDiff(parsedFiles, config, options, file1);
    let maybeChangelogUrl: string | null = null;
    let specUrl: string | null = null;

    let [baseParseResult, headParseResult, specDetails] = parsedFiles;
    if (options.upload) {
      const uploadResults = await uploadDiff(
        {
          from: baseParseResult,
          to: headParseResult,
        },
        diffResult.specResults,
        config,
        specDetails,
        {
          headTag: options.headTag,
          standard: diffResult.standard,
        }
      );
      specUrl = uploadResults?.headSpecUrl ?? null;
      maybeChangelogUrl = uploadResults?.changelogUrl ?? null;
    }
    if (options.json) {
      console.log(
        JSON.stringify(
          jsonChangelog(
            { from: baseParseResult.jsonLike, to: headParseResult.jsonLike },
            diffResult.changelogData
          )
        )
      );
    } else {
      for (const warning of diffResult.warnings) {
        logger.warn(warning);
      }

      let sourcemapOptions: GetSourcemapOptions = {
        ciProvider: undefined,
      };
      if (config.isInCi && config.vcs?.type === VCS.Git) {
        const remote = await Git.guessRemoteOrigin();
        if (remote) {
          sourcemapOptions = {
            ciProvider: remote.provider,
            remote: remote.web_url,
            sha: config.vcs.sha,
            root: config.root,
          };
        }
      }
      for (const log of terminalChangelog(
        { from: baseParseResult, to: headParseResult },
        diffResult.changelogData,
        diffResult.specResults,
        {
          ...sourcemapOptions,
          path: file1,
          check: options.check,
          inCi: config.isInCi,
          output: 'pretty',
          verbose: false,
          severity: textToSev(options.severity),
          previewDocsLink: specUrl,
        }
      )) {
        logger.info(log);
      }
    }

    if (config.isInCi && !options.upload) renderCloudSetup();

    if (options.web) {
      if (
        diffResult.specResults.diffs.length === 0 &&
        (!options.check || diffResult.specResults.results.length === 0)
      ) {
        logger.info('Empty changelog: not opening web view');
      } else {
        const analyticsData: Record<string, any> = {
          isInCi: config.isInCi,
        };

        if (!maybeChangelogUrl) {
          const meta = {
            createdAt: new Date(),
            command: ['optic', ...process.argv.slice(2)].join(' '),
            file1,
            file2,
            base: options.base,
          };

          const compressedData = compressDataV2(
            baseParseResult,
            headParseResult,
            diffResult.specResults,
            meta,
            diffResult.changelogData
          );
          analyticsData.compressedDataLength = compressedData.length;
          logger.info('Opening up diff in web view');
          maybeChangelogUrl = `${config.client.getWebBase()}/cli/diff#${compressedData}`;
          await flushEvents();
        }
        trackEvent('optic.diff.view_web', analyticsData);
        await openUrl(maybeChangelogUrl);
      }
    }

    if (config.isInCi) {
      await writeDataForCi(
        [
          {
            warnings: diffResult.warnings,
            groupedDiffs: diffResult.changelogData,
            name: file1,
            results: diffResult.specResults.results,
            specUrl,
            changelogUrl: maybeChangelogUrl,
          },
        ],
        {
          severity: textToSev(options.severity),
        }
      );
    } else if (!options.web && !options.json) {
      logger.info(
        chalk.blue(
          `Rerun this command with the --web flag to view the detailed changes in your browser`
        )
      );
    }

    const maybeOrigin =
      config.vcs?.type === VCS.Git ? await Git.guessRemoteOrigin() : null;

    const relativePath = path.relative(config.root, path.resolve(file1));
    trackEvent('optic.diff.completed', {
      specPath: relativePath,
      diffs: diffResult.specResults.diffs.length,
      checks: diffResult.specResults.results.length,
      isCloudRun: options.upload,
      isInCi: config.isInCi,
      ...(maybeOrigin?.web_url
        ? {
            webUrlAndPath: `${maybeOrigin.web_url}.${relativePath}`,
            webUrl: maybeOrigin.web_url,
          }
        : {}),
    });

    const failures = diffResult.checks.failed;
    const failuresForSeverity =
      options.severity === 'error'
        ? failures.error
        : options.severity === 'warn'
          ? failures.warn + failures.error
          : failures.warn + failures.error + failures.info;

    if (failuresForSeverity > 0 && options.check) process.exitCode = 1;
  };
