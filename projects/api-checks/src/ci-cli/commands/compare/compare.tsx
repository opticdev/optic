import React, { useEffect, useState } from 'react';
import { SpecFromInput } from '../../input-helpers/compare-input-parser';
import { Box, Text, useApp, useStdout } from 'ink';
import { ApiCheckService } from '../../../sdk/api-check-service';
import { SpecComparison } from './components';
import { specFromInputToResults } from '../../input-helpers/load-spec';
import { generateSpecResults } from './generateSpecResults';
import { writeFile } from '../utils';
import { DEFAULT_COMPARE_OUTPUT_FILENAME } from '../../constants';
import { ResultWithSourcemap } from '../../../sdk/types';
import { SentryClient } from '../../sentry';

type LoadingState =
  | {
      loading: true;
    }
  | {
      loading: false;
      error: Error;
    }
  | {
      loading: false;
      error: false;
    };

export function Compare<T>(props: {
  from: SpecFromInput;
  to: SpecFromInput;
  context: T;
  verbose: boolean;
  output: 'pretty' | 'json' | 'plain';
  apiCheckService: ApiCheckService<T>;
  shouldGenerateFile: boolean;
}) {
  const stdout = useStdout();
  const { exit } = useApp();
  // TODO change this to something less handwritten
  const [fromState, setFromState] = useState<LoadingState>({
    loading: true,
  });
  const [toState, setToState] = useState<LoadingState>({
    loading: true,
  });
  const [outputFileLocation, setOutputFileLocation] = useState<string | null>(
    null
  );

  const [results, setResults] = useState<
    | {
        loading: true;
      }
    | {
        loading: false;
        error: Error;
      }
    | { loading: false; error: false; data: ResultWithSourcemap[] }
  >({ loading: true });
  useEffect(() => {
    let isStale = false;
    (async () => {
      try {
        const [from, to] = await Promise.all([
          specFromInputToResults(props.from, process.cwd())
            .then((results) => {
              !isStale &&
                setFromState({
                  loading: false,
                  error: false,
                });
              return results;
            })
            .catch((e) => {
              !isStale &&
                setFromState({
                  loading: false,
                  error: e,
                });
              throw new Error('Could not load from state');
            }),
          specFromInputToResults(props.to, process.cwd())
            .then((results) => {
              !isStale &&
                setToState({
                  loading: false,
                  error: false,
                });
              return results;
            })
            .catch((e) => {
              !isStale &&
                setToState({
                  loading: false,
                  error: e,
                });
              throw new Error('Could not load to state');
            }),
        ]);

        try {
          const results = await generateSpecResults(
            props.apiCheckService,
            from,
            to,
            props.context
          );

          if (props.shouldGenerateFile) {
            const compareOutputLocation = await writeFile(
              DEFAULT_COMPARE_OUTPUT_FILENAME,
              Buffer.from(
                JSON.stringify({
                  results,
                })
              )
            );
            !isStale && setOutputFileLocation(compareOutputLocation);
          }

          if (!isStale) {
            setResults({ loading: false, error: false, data: results });
          }
          const hasError = results.some((result) => !result.passed);

          exit();
          // TODO bubble this up to the handler instead of process exiting here
          if (hasError) {
            process.exit(1);
          } else {
            process.exit(0);
          }
        } catch (e) {
          SentryClient && SentryClient.captureException(e);
          !isStale && setResults({ loading: false, error: e as Error });
          process.exit(1);
        }
      } catch (e) {
        console.error(e);
        SentryClient && SentryClient.captureException(e);
        exit();
        process.exit(1);
      }
    })();

    return () => {
      isStale = false;
    };
  }, []);

  const loadStatus = (spec: string, state: LoadingState) => {
    return (
      <Text color="white">
        {spec} specification:{' '}
        {state.loading ? (
          <Text color="green" bold>
            loading...
          </Text>
        ) : state.error !== false ? (
          <Text color="red" bold>
            {state.error.message?.split('\n')[0]}
          </Text>
        ) : (
          <Text color="green" bold>
            done
          </Text>
        )}
      </Text>
    );
  };

  if (props.output == 'json') {
    if ('data' in results) {
      const filteredResults = props.verbose
        ? results.data
        : results.data.filter((x) => !x.passed);
      stdout.write(JSON.stringify(filteredResults, null, 2));
    }
    return null;
  }

  return (
    <Box flexDirection="column" width={process.env.COLUMNS || '5000'}>
      <Text color="blue" bold>
        Loading specifications for comparison:
      </Text>

      {loadStatus('Current', fromState)}
      {loadStatus('Next', toState)}

      {((!fromState.loading && fromState.error !== false) ||
        (!toState.loading && toState.error !== false)) && (
        <Text color="red">
          Stopping. Could not load two specifications to compare
        </Text>
      )}
      {((!fromState.loading && fromState.error === false) ||
        (!toState.loading && toState.error === false)) && (
        <>
          <Text>running rules...</Text>
        </>
      )}
      {results.loading ? null : results.error ? (
        <Text>
          Error running rules: {JSON.stringify(results.error.message)}
        </Text>
      ) : (
        <SpecComparison results={results.data} verbose={props.verbose} />
      )}
      {outputFileLocation && (
        <Text>Results of this run can be found at: {outputFileLocation}</Text>
      )}
    </Box>
  );
}
