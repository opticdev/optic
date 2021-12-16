import React, { useEffect, useState } from 'react';
import { Command } from 'commander';

import { Box, Text, render, useApp, useStdout } from 'ink';
import { defaultEmptySpec } from '@useoptic/openapi-utilities';
import {
  SpecFromInput,
  parseSpecVersion,
} from '../../input-helpers/compare-input-parser';
import { specFromInputToResults } from '../../input-helpers/load-spec';
import { ApiCheckService } from '../../../sdk/api-check-service';
import { SpecComparison } from './components';
import { generateSpecResults } from './generateSpecResults';
import { writeFile } from '../utils';
import { DEFAULT_COMPARE_OUTPUT_FILENAME } from '../../constants';
import { ResultWithSourcemap } from '../../../sdk/types';
import { SentryClient, wrapActionHandlerWithSentry } from '../../sentry';
import { OpticCINamedRulesets } from '../../../sdk/ruleset';

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

export const registerCompare = <T extends {}>(
  cli: Command,
  rulesetServices: OpticCINamedRulesets
) => {
  cli
    .command('compare')
    .option('--from <from>', 'from file or rev:file, defaults empty spec')
    .option('--to <to>', 'to file or rev:file, defaults empty spec')
    .option('--context <context>', 'json of context')
    .option('--verbose', 'show all checks, even passing', false)
    .option('--ruleset <ruleset>', 'name of ruleset to run', 'default')
    .option(
      '--create-file',
      'creates a file with the results of the run in json format',
      false
    )
    .option(
      '--output <format>',
      "show 'pretty' output for interactive usage or 'json' for JSON",
      'pretty'
    )
    .action(
      wrapActionHandlerWithSentry(
        async (options: {
          from?: string;
          to?: string;
          context?: string;
          verbose: boolean;
          output: 'pretty' | 'json' | 'plain';
          ruleset: string;
          createFile: boolean;
        }) => {
          const checkService = rulesetServices[options.ruleset];
          if (!checkService) {
            console.error(
              `Ruleset named ${
                options.ruleset
              } is not registered. valid options: ${JSON.stringify(
                Object.keys(rulesetServices)
              )}`
            );
            return process.exit(1);
          }

          if (options.output === 'plain') {
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
          try {
            const parsedContext = options.context
              ? JSON.parse(options.context)
              : {};
            const { waitUntilExit } = render(
              <Compare
                verbose={options.verbose}
                output={options.output}
                apiCheckService={checkService}
                from={parseSpecVersion(options.from, defaultEmptySpec)}
                to={parseSpecVersion(options.to, defaultEmptySpec)}
                context={parsedContext}
                shouldGenerateFile={options.createFile}
              />,
              { exitOnCtrlC: true }
            );
            await waitUntilExit();
          } catch (e) {
            console.error(
              `Could not parse the context object provided at --context ${
                options.context
              }. Got an error: ${(e as Error).message}`
            );
          }
        }
      )
    );
};

function Compare<T>(props: {
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
