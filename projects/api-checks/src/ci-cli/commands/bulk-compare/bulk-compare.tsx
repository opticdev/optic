import { Command, Option } from 'commander';
import React, { FC, useEffect, useState } from 'react';
import { Box, Newline, render, Text, useApp, useStderr, useStdout } from 'ink';
import { v4 as uuidv4 } from 'uuid';

import {
  defaultEmptySpec,
  IChange,
  OpenApiFact,
  validateOpenApiV3Document,
  ResultWithSourcemap,
} from '@useoptic/openapi-utilities';
import { ParseOpenAPIResult } from '@useoptic/openapi-io';
import { SpecComparison } from '../components';
import { ApiCheckService } from '../../../sdk/api-check-service';
import { wrapActionHandlerWithSentry, SentryClient } from '../../sentry';
import {
  loadFile,
  parseSpecVersion,
  specFromInputToResults,
  validateUploadRequirements,
  generateSpecResults,
} from '../utils';

import { OpticCINamedRulesets } from '../../../sdk/ruleset';
import { UserError } from '../../errors';
import { SourcemapRendererEnum } from '../components/render-results';
import { trackEvent, flushEvents } from '../../segment';
import { CliConfig, BulkCompareJson, BulkUploadJson } from '../../types';
import { createOpticClient } from '../utils/optic-client';
import { bulkUploadCiRun } from './bulk-upload';
import { sendBulkGithubMessage } from './bulk-github-comment';

export const registerBulkCompare = (
  cli: Command,
  projectName: string,
  rulesetServices: OpticCINamedRulesets,
  cliConfig: CliConfig
) => {
  cli
    .command('bulk-compare')
    .requiredOption(
      '--input <input>',
      'a csv with the from, to files, and context format: <from>,<to>,<jsonified context>'
    )
    .option('--verbose', 'show all checks, even passing', false)
    .option('--ruleset <ruleset>', 'name of ruleset to run', 'default')
    .addOption(
      new Option(
        '--output <output>',
        "show 'pretty' output for interactive usage or 'json' for JSON, defaults to 'pretty'"
      ).choices(['pretty', 'json', 'plain'])
    )
    .option(
      '--upload-results',
      'upload results of this run to optic cloud',
      false
    )
    .option(
      '--ci-context <ciContext>',
      'path to file with the context shape from the ci provider (e.g. github actions, circle ci)'
    )
    .action(
      wrapActionHandlerWithSentry(
        async ({
          input,
          verbose,
          ruleset,
          output = 'pretty',
          uploadResults,
          ciContext,
        }: {
          input: string;
          verbose: boolean;
          ruleset: string;
          output?: 'pretty' | 'json' | 'plain';
          uploadResults: boolean;
          ciContext?: string;
        }) => {
          const checkService = rulesetServices[ruleset];
          if (!checkService) {
            console.error(
              `Ruleset named ${ruleset} is not registered. valid options: ${JSON.stringify(
                Object.keys(rulesetServices)
              )}`
            );
            return process.exit(1);
          }

          if (output === 'plain') {
            // https://github.com/chalk/chalk#supportscolor
            // https://github.com/chalk/supports-color/blob/ff1704d46cfb0714003f53c8d7e55736d8d545ff/index.js#L38
            if (
              process.env.FORCE_COLOR !== 'false' &&
              process.env.FORCE_COLOR !== '0'
            ) {
              console.error(
                `Please set FORCE_COLOR=false or FORCE_COLOR=0 to enable plain text output in the environment you want to run this command in`
              );
              return process.exit(1);
            }
          }
          validateUploadRequirements(uploadResults, cliConfig, ciContext);

          const { waitUntilExit } = render(
            <BulkCompare
              checkService={checkService}
              input={input}
              verbose={verbose}
              output={output}
              projectName={projectName}
              uploadResults={uploadResults}
              ciContext={ciContext}
              cliConfig={cliConfig}
            />,
            { exitOnCtrlC: true }
          );
          await waitUntilExit();
          process.exit(0);
        }
      )
    );
};

type Comparison = {
  id: string;
  fromFileName?: string;
  toFileName?: string;
  context: any;
} & (
  | { loading: true }
  | { loading: false; error: true; errorDetails: any }
  | {
      loading: false;
      error: false;
      data: {
        changes: IChange<OpenApiFact>[];
        results: ResultWithSourcemap[];
      };
    }
);

const loadSpecFile = async (fileName?: string): Promise<ParseOpenAPIResult> => {
  return specFromInputToResults(
    parseSpecVersion(fileName, defaultEmptySpec),
    process.cwd()
  );
};

// TODO extract out the parallel request promise logic into a generic fn and write tests around this
// TODO type of `Comparison` can be narrowed
const compareSpecs = async ({
  checkService,
  comparisons,
  onComparisonComplete,
  onComparisonError,
}: {
  checkService: ApiCheckService<any>;
  comparisons: Map<string, Comparison>;
  onComparisonComplete: (
    id: string,
    data: {
      changes: IChange<OpenApiFact>[];
      results: ResultWithSourcemap[];
    }
  ) => void;
  onComparisonError: (id: string, error: any) => void;
}) => {
  const PARALLEL_REQUESTS = 4;
  const inflightRequests = new Map<string, Promise<string>>();
  for (const [id, comparison] of comparisons.entries()) {
    if (inflightRequests.size >= PARALLEL_REQUESTS) {
      // await, then remove
      const resolvePromiseId = await Promise.race([
        ...inflightRequests.values(),
      ]);
      inflightRequests.delete(resolvePromiseId);
    }
    // Enqueue next
    inflightRequests.set(
      id,
      new Promise<{
        id: string;
        data: {
          changes: IChange<OpenApiFact>[];
          results: ResultWithSourcemap[];
        };
      }>(async (resolve, reject) => {
        try {
          const [from, to] = await Promise.all([
            loadSpecFile(comparison.fromFileName),
            loadSpecFile(comparison.toFileName),
          ]);

          validateOpenApiV3Document(from.jsonLike);
          validateOpenApiV3Document(to.jsonLike);

          const { results, changes } = await generateSpecResults(
            checkService,
            from,
            to,
            comparison.context
          );
          resolve({
            id,
            data: {
              results,
              changes,
            },
          });
        } catch (e) {
          reject({
            id,
            error: e,
          });
        }
      })
        .then(({ id, data }) => {
          onComparisonComplete(id, data);
          return id;
        })
        .catch((e) => {
          const { id, error } = e as { id: string; error: any };
          onComparisonError(id, error);
          return id;
        })
    );
  }

  // Then wait for all the remaining requests to complete
  await Promise.all([...inflightRequests.values()]);
};

export const parseJsonComparisonInput = async (
  input: string
): Promise<{
  comparisons: Map<string, Comparison>;
  skippedParsing: boolean;
}> => {
  const fileOutput = await loadFile(input);
  let skippedParsing = false;
  const output = JSON.parse(fileOutput.toString());
  const initialComparisons: Map<string, Comparison> = new Map();
  for (const comparison of output.comparisons || []) {
    if (!comparison.context) {
      console.log(
        `Comparison doesn't match expected format, found: ${JSON.stringify(
          comparison
        )}`
      );
      skippedParsing = true;
      continue;
    }
    const id = uuidv4();

    initialComparisons.set(id, {
      id,
      fromFileName: comparison.from,
      toFileName: comparison.to,
      context: comparison.context,
      loading: true,
    });
  }

  return { comparisons: initialComparisons, skippedParsing };
};

// TODO if we want this to parse a large amount of data, we'll want to convert this to read as a stream
// We'll need to remove usage of `ink` and use a write stream to stdout (or get ink to dump a react component to stdout)
// Expected usage is likely low (10s-100s) so streams are not likely to be necessarily
const BulkCompare: FC<{
  checkService: ApiCheckService<any>;
  input: string;
  verbose: boolean;
  projectName: string;
  output: 'pretty' | 'json' | 'plain';
  uploadResults: boolean;
  ciContext?: string;
  cliConfig: CliConfig;
}> = ({
  input,
  verbose,
  output,
  checkService,
  projectName,
  uploadResults,
  ciContext,
  cliConfig,
}) => {
  const { exit } = useApp();
  const stdout = useStdout();
  const stderr = useStderr();
  const [comparisons, setComparisons] = useState<Map<string, Comparison>>(
    new Map()
  );
  const [uploadState, setUploadState] = useState<
    | {
        state: 'not started' | 'no changes';
      }
    | {
        state: 'complete';
        bulkUploadJson: BulkUploadJson;
      }
    | {
        state: 'started';
        numberOfUploads: number;
        numberOfComparisons: number;
      }
    | {
        state: 'error';
        error: Error;
      }
  >({ state: 'not started' });
  const [commentState, setCommentState] = useState<
    | { state: 'not started' }
    | { state: 'github' }
    | { state: 'error'; error: Error }
  >({ state: 'not started' });

  useEffect(() => {
    let isStale = false;
    (async () => {
      try {
        console.log('Reading input file...');
        let numberOfErrors = 0;
        let numberOfComparisonsWithErrors = 0;
        let numberOfComparisonsWithAChange = 0;
        let hasChecksFailing = false;
        let hasError = false;
        const { comparisons: initialComparisons, skippedParsing } =
          await parseJsonComparisonInput(input);

        !isStale && setComparisons(initialComparisons);
        const finalComparisons = new Map(initialComparisons);

        await compareSpecs({
          checkService,
          comparisons: initialComparisons,
          onComparisonComplete: (id, { results, changes }) => {
            if (results.some((result) => !result.passed)) {
              hasChecksFailing = true;
              numberOfComparisonsWithErrors += 1;
              numberOfErrors += results.reduce(
                (count, result) => (result.passed ? count : count + 1),
                0
              );
            }
            if (changes.length > 0) {
              numberOfComparisonsWithAChange += 1;
            }
            finalComparisons.set(id, {
              ...initialComparisons.get(id)!,
              loading: false,
              error: false,
              data: {
                results,
                changes,
              },
            });
          },
          onComparisonError: (id, error) => {
            hasError = true;
            finalComparisons.set(id, {
              ...initialComparisons.get(id)!,
              loading: false,
              error: true,
              errorDetails: error,
            });
          },
        });

        trackEvent('optic_ci.bulk_compare', `${projectName}-optic-ci`, {
          isInCi: process.env.CI === 'true',
          numberOfErrors,
          numberOfComparisons: initialComparisons.size,
          numberOfComparisonsWithErrors,
          numberOfComparisonsWithAChange,
        });

        !isStale && setComparisons(finalComparisons);

        const maybeError = skippedParsing
          ? new UserError('Error: Could not read all of the comparison inputs')
          : hasError
          ? new UserError('Error: Could not run all of the comparisons')
          : undefined;

        if (!maybeError) {
          const bulkCompareOutput: BulkCompareJson = {
            comparisons: [...finalComparisons].map(([, comparison]) => {
              if (comparison.loading || comparison.error) {
                throw new Error(
                  'Expected comparison to be loaded without errors'
                );
              }
              return {
                results: comparison.data.results,
                changes: comparison.data.changes,
                inputs: {
                  from: comparison.fromFileName,
                  to: comparison.toFileName,
                },
              };
            }),
          };
          if (uploadResults) {
            !isStale &&
              setUploadState({
                state: 'started',
                numberOfUploads: bulkCompareOutput.comparisons.filter(
                  (comparison) => comparison.changes.length > 0
                ).length,
                numberOfComparisons: bulkCompareOutput.comparisons.length,
              });

            // We've validated the shape in validateUploadRequirements
            const ciContextNotNull = ciContext!;
            const ciProvider = cliConfig.ciProvider!;
            const opticToken = cliConfig.opticToken!;
            const { token, provider } = cliConfig.gitProvider!;
            const opticClient = createOpticClient(opticToken);

            try {
              const bulkUploadOutput = await bulkUploadCiRun(
                opticClient,
                bulkCompareOutput,
                ciContextNotNull,
                ciProvider
              );
              if (bulkUploadOutput) {
                // In the future we can add different git providers
                if (provider === 'github') {
                  setCommentState({
                    state: 'github',
                  });

                  try {
                    await sendBulkGithubMessage({
                      githubToken: token,
                      uploadOutput: bulkUploadOutput,
                    });
                  } catch (e) {
                    setCommentState({
                      state: 'error',
                      error: e as Error,
                    });
                    SentryClient?.captureException(e);
                  }
                }
                !isStale &&
                  setUploadState({
                    state: 'complete',
                    bulkUploadJson: bulkUploadOutput,
                  });
              } else {
                !isStale &&
                  setUploadState({
                    state: 'no changes',
                  });
              }
            } catch (e) {
              !isStale &&
                setUploadState({
                  state: 'error',
                  error: e as Error,
                });
              SentryClient?.captureException(e);
            }
          }
        }
        await flushEvents();

        exit(maybeError || hasChecksFailing ? new UserError() : undefined);
      } catch (e) {
        stderr.write(JSON.stringify(e, null, 2));
        exit(e as Error);
      }
    })();
    return () => {
      isStale = true;
    };
  }, [input, exit, stderr]);

  if (output === 'json') {
    if (
      comparisons.size > 0 &&
      [...comparisons.values()].every((comparison) => !comparison.loading)
    ) {
      stdout.write(JSON.stringify([...comparisons.values()], null, 2));
    }
    return null;
  }

  return (
    <Box flexDirection="column" width={process.env.COLUMNS || '5000'}>
      <Text>Bulk comparing</Text>

      <Newline />

      {[...comparisons.values()].map((comparison) => {
        return (
          <Box
            key={comparison.fromFileName || '' + comparison.toFileName || ''}
            flexDirection="column"
          >
            <Box>
              <Text>
                Comparing {comparison.fromFileName || 'Empty spec'} to{' '}
                {comparison.toFileName || 'Empty spec'}
              </Text>
            </Box>
            <Box>
              {comparison.loading ? (
                <Text>Loading</Text>
              ) : comparison.error ? (
                <Text>
                  Error loading file: {JSON.stringify(comparison.errorDetails)}
                </Text>
              ) : (
                <SpecComparison
                  results={comparison.data.results}
                  verbose={verbose}
                  mapToFile={SourcemapRendererEnum.local}
                />
              )}
            </Box>
            <Newline />
          </Box>
        );
      })}
      {uploadState.state === 'started' ? (
        <Text>
          Uploading {uploadState.numberOfUploads} comparisons with at least 1
          change to Optic... (
          {uploadState.numberOfComparisons - uploadState.numberOfUploads} did
          not have any changes)
        </Text>
      ) : uploadState.state === 'no changes' ? (
        <Text>
          None of the comparisons had any changes, not uploading anything
        </Text>
      ) : uploadState.state === 'complete' ? (
        <>
          <Text>
            Successfully uploaded{' '}
            {uploadState.bulkUploadJson.comparisons.length} comparisons that had
            at least 1 change
          </Text>
          <Text>These files can be found in</Text>
          {uploadState.bulkUploadJson.comparisons.map((comparison) => (
            <Text>
              from: {comparison.inputs.from || 'Empty Spec'} to:{' '}
              {comparison.inputs.to || 'Empty Spec'} - {comparison.opticWebUrl}
            </Text>
          ))}
        </>
      ) : uploadState.state === 'error' ? (
        <>
          <Text>
            Error uploading the run to Optic - exiting with a zero exit code.
          </Text>
          <Text color="red">{JSON.stringify(uploadState.error.message)}</Text>
        </>
      ) : null}
      {commentState.state === 'github' && (
        <Text>Posting comment to github</Text>
      )}
      {commentState.state === 'error' && (
        <>
          <Text>
            Failed to post comment to github - exiting with a zero exit code.
          </Text>
          <Text color="red">{JSON.stringify(commentState.error.message)}</Text>
        </>
      )}
    </Box>
  );
};
