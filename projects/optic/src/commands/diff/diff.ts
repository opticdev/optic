import { Command } from 'commander';
import brotli from 'brotli';
import open from 'open';

import {
  generateSpecResults,
  logComparison,
  generateChangelogData,
  terminalChangelog,
  OpenAPIV3,
  IChange,
} from '@useoptic/openapi-utilities';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import {
  BreakingChangesRuleset,
  NamingChangesRuleset,
} from '@useoptic/standard-rulesets';
import { RuleRunner, Ruleset } from '@useoptic/rulesets-base';
import {
  parseFilesFromRef,
  ParseResult,
  getFileFromFsOrGit,
} from '../../utils/spec-loaders';
import { OpticCliConfig, VCS } from '../../config';
import chalk from 'chalk';
import {
  flushEvents,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';
import { getAnonId } from '../../utils/anonymous-id';

const description = `run a diff between two API specs`;

const usage = () => `
  optic diff --id user-api --base <base>
  optic diff <file_path> --base <base>
  optic diff <file_path> <file_to_compare_against>
  optic diff <file_path> <file_to_compare_against> --check`;

const helpText = `
Example usage:
  Run a diff against the api spec \`user-api\` using the config from your \`optic.yml\` file against master
  $ optic diff --id user-api --base master

  Run a diff between \`master:specs/openapi-spec.yml\` and \`specs/openapi-spec.yml\`
  $ optic diff openapi-spec.yml --base master

  Run a diff between \`openapi-spec-v0.yml\` and \`openapi-spec-v1.yml\`
  $ optic diff openapi-spec-v0.yml openapi-spec-v1.yml
  
  Run a diff and view changes in the Optic web view
  $ optic diff --id user-api --base master --web
  
  Run a diff and check the changes against configured rulesets:
  $ optic diff openapi-spec-v0.yml openapi-spec-v1.yml --check
  `;

type SpecResults = Awaited<ReturnType<typeof generateSpecResults>>;
const webBase =
  process.env.OPTIC_ENV === 'staging'
    ? 'https://app.o3c.info'
    : process.env.OPTIC_ENV === 'local'
    ? 'http://localhost:3000'
    : 'https://app.useoptic.com';

const stdRulesets = {
  'breaking-changes': BreakingChangesRuleset,
  // 'naming-changes': NamingChangesRuleset,
};

export const registerDiff = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('diff')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description(description)
    .argument('[file_path]', 'path to file to compare')
    .argument('[file_to_compare_against]', 'path to file to compare with')
    .option(
      '--base <base>',
      'the base ref to compare against. Defaults to master',
      'master'
    )
    .option(
      '--id <id>',
      'the id of the spec to run against in defined in the `optic.yml` file'
    )
    .option('--check', 'enable checks', false)
    .option('--web', 'view the diff in the optic changelog web view', false)
    .action(
      wrapActionHandlerWithSentry(
        async (
          file1: string | undefined,
          file2: string | undefined,
          options: {
            base: string;
            id?: string;
            check: boolean;
            web: boolean;
          }
        ) => {
          let baseFile: ParseResult;
          let headFile: ParseResult;

          if (file1 && file2) {
            const baseFilePath = file1;
            const headFilePath = file2;
            [baseFile, headFile] = await Promise.all([
              getFileFromFsOrGit(baseFilePath),
              getFileFromFsOrGit(headFilePath),
            ]);
          } else if (file1) {
            const commandVariant = `optic diff <file> --base <ref>`;
            if (config.vcs !== VCS.Git) {
              console.error(
                `Error: ${commandVariant} must be called from a git repository.`
              );
              return;
            }

            ({ baseFile, headFile } = await parseFilesFromRef(
              file1,
              options.base,
              config.root
            ));
          } else if (options.id) {
            const commandVariant = `optic diff --id <id> --base <ref>`;
            if (config.vcs !== VCS.Git) {
              console.error(
                `Error: ${commandVariant} must be called from a git repository.`
              );
              return;
            }
            if (!config.configPath) {
              console.error(
                `Error: no optic.yml config file was found. optic.yml must be included for ${commandVariant}`
              );
              return;
            }

            console.log('Running diff against files from optic.yml file');
            const files = config.files;
            const maybeMatchingFile = files.find(
              (file) => file.id === options.id
            );

            if (maybeMatchingFile) {
              ({ baseFile, headFile } = await parseFilesFromRef(
                maybeMatchingFile.path,
                options.base,
                config.root
              ));
            } else {
              console.error(
                `id: ${options.id} was not found in the optic.yml file`
              );
              console.log(
                `valid list of file names: ${files
                  .map((file) => file.id)
                  .join(', ')}`
              );
              return;
            }
          } else {
            console.error('Invalid combination of arguments');
            console.log(helpText);
            return;
          }

          const ruleRunner = generateRuleRunner(config, options.check);
          const specResults = await generateSpecResults(
            ruleRunner,
            baseFile,
            headFile,
            null
          );

          const changelogData = generateChangelogData({
            changes: specResults.changes,
            toFile: headFile.jsonLike,
          });

          console.log('');
          for (const log of terminalChangelog(changelogData)) {
            console.log(log);
          }

          if (options.check) {
            if (specResults.results.length > 0) {
              console.log('Checks');
              console.log('');
            }

            logComparison(specResults, { output: 'pretty', verbose: false });
          }

          if (options.web) {
            const meta = {
              createdAt: new Date(),
              command: ['optic', ...process.argv.slice(2)].join(' '),
              file1,
              file2,
              base: options.base,
              id: options.id,
            };

            const compressedData = compressData(
              baseFile,
              headFile,
              specResults,
              meta
            );
            console.log('Opening up diff in web view');
            const anonymousId = await getAnonId();
            trackEvent('optic.diff.view_web', anonymousId, {
              compressedDataLength: compressedData.length,
            });
            await flushEvents();
            await openBrowserToPage(`${webBase}/cli/diff#${compressedData}`);
          } else {
            console.log(
              chalk.blue(
                `Rerun this command with the --web flag to view these changes to view the detailed changes`
              )
            );
          }
        }
      )
    );
};

// We can remove the components from spec since the changelog is flattened, and any valid refs will
// already be added into endpoints they're used in
const removeComponentsFromSpec = (
  spec: OpenAPIV3.Document
): OpenAPIV3.Document => {
  const { components, ...componentlessSpec } = spec;
  return componentlessSpec;
};

const removeSourcemapsFromResults = (specResults: SpecResults): SpecResults => {
  const { results, changes, ...rest } = specResults;

  return {
    ...rest,
    results: results.map((result) => {
      const { sourcemap, ...sourcemaplessResult } = result;
      return sourcemaplessResult;
    }),
    changes: changes.map((change) => {
      const { sourcemap, ...sourcemaplessLocation } = change.location;
      return {
        ...change,
        location: {
          ...sourcemaplessLocation,
        },
      };
    }) as IChange[],
  };
};

const compressData = (
  baseFile: ParseResult,
  headFile: ParseResult,
  specResults: SpecResults,
  meta: Record<string, unknown>
): string => {
  const dataToCompress = {
    base: removeComponentsFromSpec(baseFile.jsonLike),
    head: removeComponentsFromSpec(headFile.jsonLike),
    results: removeSourcemapsFromResults(specResults),
    meta,
    version: '1',
  };
  const compressed = brotli.compress(
    Buffer.from(JSON.stringify(dataToCompress))
  );
  const urlSafeString = Buffer.from(compressed).toString('base64');
  return urlSafeString;
};

const openBrowserToPage = async (url: string) => {
  await open(url, { wait: false });
};

const generateRuleRunner = (
  config: OpticCliConfig,
  checksEnabled: boolean
): RuleRunner => {
  const rulesets: Ruleset[] = [];

  if (checksEnabled) {
    for (const rule of config.ruleset) {
      if (typeof rule === 'string' && stdRulesets[rule]) {
        rulesets.push(new stdRulesets[rule]());
      } else {
        console.error(`Warning: Invalid ruleset ${rule}`);
      }
    }
  }

  return new RuleRunner(rulesets);
};
