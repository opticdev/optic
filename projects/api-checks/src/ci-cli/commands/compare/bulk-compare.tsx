import { Command, Option } from 'commander';
import React, { FC, useEffect, useState } from 'react';
import { Box, Text, useApp, useStderr, render, Newline, useStdout } from 'ink';
import { parse } from 'csv-parse/sync';
import { v4 as uuidv4 } from 'uuid';

import { defaultEmptySpec } from '@useoptic/openapi-utilities';
import { ParseOpenAPIResult } from '@useoptic/openapi-io';
import { SpecComparison } from './components';
import { parseSpecVersion } from '../../input-helpers/compare-input-parser';
import { specFromInputToResults } from '../../input-helpers/load-spec';
import { ApiCheckService } from '../../../sdk/api-check-service';
import { ResultWithSourcemap } from '../../../sdk/types';
import { wrapActionHandlerWithSentry } from '../../sentry';
import { loadFile } from '../upload/utils';
import { generateSpecResults } from './utils';

export const registerBulkCompare = <T extends {}>(
  cli: Command,
  checkService: ApiCheckService<T>
) => {
  cli
    .command('bulk-compare')
    .requiredOption(
      '--input <input>',
      'a csv with the from and to files, format: <from>,<to>'
    )
    .option('--context <context>', 'json of context')
    .option('--verbose <verbose>', 'show all checks, even passing', false)
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
          context = {},
          verbose,
          output = 'pretty',
        }: {
          input: string;
          context?: any;
          verbose: boolean;
          output?: 'pretty' | 'json' | 'plain';
        }) => {
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
              context={context}
              verbose={verbose}
              output={output}
            />,
            { exitOnCtrlC: true }
          );
          await waitUntilExit();
        }
      )
    );
};

type Comparison = {
  id: string;
  fromFileName: string;
  toFileName: string;
} & (
  | { loading: true }
  | { loading: false; error: true; errorDetails: any }
  | { loading: false; error: false; results: ResultWithSourcemap[] }
);

const loadSpecFile = async (fileName: string): Promise<ParseOpenAPIResult> => {
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
  context,
}: {
  checkService: ApiCheckService<any>;
  comparisons: Map<string, Comparison>;
  onComparisonComplete: (id: string, results: ResultWithSourcemap[]) => void;
  onComparisonError: (id: string, error: any) => void;
  context: any;
}) => {
  const PARALLEL_REQUESTS = 4;
  const inflightRequests = new Map<string, Promise<string>>();
  for (const [id, files] of comparisons.entries()) {
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
              loadSpecFile(files.fromFileName),
              loadSpecFile(files.toFileName),
            ]);
            const results = await generateSpecResults(
              checkService,
              from,
              to,
              context
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

export const parseCsvComparisonInput = async (
  input: string
): Promise<Map<string, Comparison>> => {
  const fileOutput = await loadFile(input);
  const output = parse(fileOutput, {
    skipEmptyLines: true,
    trim: true,
    // We handle this separately to provide better user feedback rather than erroring
    relaxColumnCount: true,
  });
  const initialComparisons: Map<string, Comparison> = new Map();
  for (const line of output) {
    // expected format is fromfile, tofile
    if (line.length !== 2) {
      console.log(
        `Line does not match expected format, skipping line: '${line.join(
          ', '
        )}'`
      );
      continue;
    }
    const id = uuidv4();
    initialComparisons.set(id, {
      id,
      fromFileName: line[0],
      toFileName: line[1],
      loading: true,
    });
  }

  return initialComparisons;
};

// TODO if we want this to parse a large amount of data, we'll want to convert this to read as a stream
// We'll need to remove usage of `ink` and use a write stream to stdout (or get ink to dump a react component to stdout)
// Expected usage is likely low (10s-100s) so streams are not likely to be necessarily
const BulkCompare: FC<{
  checkService: ApiCheckService<any>;
  input: string;
  context: Object;
  verbose: boolean;
  output: 'pretty' | 'json' | 'plain';
}> = ({ input, context, verbose, output, checkService }) => {
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
        const initialComparisons = await parseCsvComparisonInput(input);

        !isStale && setComparisons(initialComparisons);

        await compareSpecs({
          checkService,
          comparisons: initialComparisons,
          onComparisonComplete: (id, results) => {
            !isStale &&
              setComparisons((prevComparisons) => {
                const newComparisons = new Map(prevComparisons);
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
                newComparisons.set(id, {
                  ...prevComparisons.get(id)!,
                  loading: false,
                  error: true,
                  errorDetails: error,
                });
                return newComparisons;
              });
          },
          context,
        });

        exit();
      } catch (e) {
        stderr.write(JSON.stringify(e, null, 2));
        exit();
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
                Comparing {comparison.fromFileName} to {comparison.toFileName}
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
