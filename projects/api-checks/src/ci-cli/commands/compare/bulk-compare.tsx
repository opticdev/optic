import { Command, Option } from 'commander';
import React, { FC, useEffect, useState } from 'react';
import { Box, Text, useApp, useStderr, render, Newline, useStdout } from 'ink';
import { v4 as uuidv4 } from 'uuid';

import { defaultEmptySpec } from '@useoptic/openapi-utilities';
import { ParseOpenAPIResult } from '@useoptic/openapi-io';
import { SpecComparison } from './components';
import { parseSpecVersion } from '../../input-helpers/compare-input-parser';
import { specFromInputToResults } from '../../input-helpers/load-spec';
import { ApiCheckService } from '../../../sdk/api-check-service';
import { ResultWithSourcemap } from '../../../sdk/types';
import { SentryClient, wrapActionHandlerWithSentry } from '../../sentry';
import { loadFile } from '../utils';
import { generateSpecResults } from './generateSpecResults';
import { OpticCINamedRulesets } from '../../../sdk/ruleset';

export const registerBulkCompare = <T extends {}>(
  cli: Command,
  rulesetServices: OpticCINamedRulesets
) => {
  cli
    .command('bulk-compare')
    .requiredOption(
      '--input <input>',
      'a csv with the from, to files, and context format: <from>,<to>,<jsonified context>'
    )
    .option('--verbose <verbose>', 'show all checks, even passing', false)
    .option('--ruleset', 'name of ruleset to run', 'default')
    .addOption(
      new Option(
        '--output <output>',
        "show 'pretty' output for interactive usage or 'json' for JSON, defaults to 'pretty'"
      ).choices(['pretty', 'json', 'plain'])
    )
    .action(
      wrapActionHandlerWithSentry(
        async ({
          input,
          verbose,
          ruleset,
          output = 'pretty',
        }: {
          input: string;
          verbose: boolean;
          ruleset: string;
          output?: 'pretty' | 'json' | 'plain';
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
          const { waitUntilExit } = render(
            <BulkCompare
              checkService={checkService}
              input={input}
              verbose={verbose}
              output={output}
            />,
            { exitOnCtrlC: true }
          );
          try {
            await waitUntilExit();
            process.exit(0);
          } catch (e) {
            console.error((e as Error).message);
            if (SentryClient) {
              SentryClient.captureException(e);
              await SentryClient.flush();
            }
            process.exit(1);
          }
        }
      )
    );
};

type Comparison = {
  id: string;
  fromFileName?: string;
  toFileName: string;
  context: any;
} & (
  | { loading: true }
  | { loading: false; error: true; errorDetails: any }
  | { loading: false; error: false; results: ResultWithSourcemap[] }
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
  onComparisonComplete: (id: string, results: ResultWithSourcemap[]) => void;
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
      new Promise<{ id: string; results: ResultWithSourcemap[] }>(
        async (resolve, reject) => {
          try {
            const [from, to] = await Promise.all([
              loadSpecFile(comparison.fromFileName),
              loadSpecFile(comparison.toFileName),
            ]);

            const results = await generateSpecResults(
              checkService,
              from,
              to,
              comparison.context
            );
            resolve({
              id,
              results,
            });
          } catch (e) {
            reject({
              id,
              error: e,
            });
          }
        }
      )
        .then(({ id, results }) => {
          onComparisonComplete(id, results);
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
    // expected format is fromfile, tofile
    if (!comparison.to || !comparison.context) {
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
  output: 'pretty' | 'json' | 'plain';
}> = ({ input, verbose, output, checkService }) => {
  const { exit } = useApp();
  const stdout = useStdout();
  const stderr = useStderr();
  const [comparisons, setComparisons] = useState<Map<string, Comparison>>(
    new Map()
  );

  useEffect(() => {
    let isStale = false;
    (async () => {
      try {
        console.log('Reading input file...');
        let hasError = false;
        const {
          comparisons: initialComparisons,
          skippedParsing,
        } = await parseJsonComparisonInput(input);

        !isStale && setComparisons(initialComparisons);

        await compareSpecs({
          checkService,
          comparisons: initialComparisons,
          onComparisonComplete: (id, results) => {
            !isStale &&
              setComparisons((prevComparisons) => {
                const newComparisons = new Map(prevComparisons);
                if (results.some((result) => !result.passed)) {
                  hasError = true;
                }
                newComparisons.set(id, {
                  ...prevComparisons.get(id)!,
                  loading: false,
                  error: false,
                  results,
                });
                return newComparisons;
              });
          },
          onComparisonError: (id, error) => {
            !isStale &&
              setComparisons((prevComparisons) => {
                const newComparisons = new Map(prevComparisons);
                hasError = true;
                newComparisons.set(id, {
                  ...prevComparisons.get(id)!,
                  loading: false,
                  error: true,
                  errorDetails: error,
                });
                return newComparisons;
              });
          },
        });

        const maybeError = skippedParsing
          ? new Error('Error: Could not read all of the comparison inputs')
          : hasError
          ? new Error('Some checks did not pass')
          : undefined;
        exit(maybeError);
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
            key={comparison.fromFileName + comparison.toFileName}
            flexDirection="column"
          >
            <Box>
              <Text>
                Comparing {comparison.fromFileName || 'Empty spec'} to{' '}
                {comparison.toFileName}
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
                  results={comparison.results}
                  verbose={verbose}
                />
              )}
            </Box>
            <Newline />
          </Box>
        );
      })}
    </Box>
  );
};
