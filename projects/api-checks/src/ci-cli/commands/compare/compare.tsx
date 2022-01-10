import React, { useEffect, useState } from 'react';
import { Command } from 'commander';

import { Box, render, Text, useApp, useStdout } from 'ink';
import {
  defaultEmptySpec,
  validateOpenApiV3Document,
} from '@useoptic/openapi-utilities';
import { ApiCheckService } from '../../../sdk/api-check-service';
import { SpecComparison } from './components';
import { generateSpecResults } from './generateSpecResults';
import {
  parseSpecVersion,
  SpecFromInput,
  specFromInputToResults,
  writeFile,
} from '../utils';
import { DEFAULT_COMPARE_OUTPUT_FILENAME } from '../../constants';
import { UserError } from '../../errors';
import { ResultWithSourcemap } from '../../../sdk/types';
import { wrapActionHandlerWithSentry } from '../../sentry';
import { OpticCINamedRulesets } from '../../../sdk/ruleset';
import { SourcemapRendererEnum } from './components/render-results';
import { trackEvent } from '../../segment';

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

const parseContextObject = (context?: string): any => {
  try {
    const parsedContext = context ? JSON.parse(context) : {};
    return parsedContext;
  } catch (e) {
    throw new UserError(
      `Could not parse the context object provided at --context ${context}. Got an error: ${
        (e as Error).message
      }`
    );
  }
};

export const registerCompare = <T extends {}>(
  cli: Command,
  projectName: string,
  rulesetServices: OpticCINamedRulesets
) => {
  cli
    .command('compare')
    .option('--from <from>', 'from file or rev:file, defaults empty spec')
    .option('--to <to>', 'to file or rev:file, defaults empty spec')
    .option('--context <context>', 'json of context')
    .option(
      '--github-annotations',
      'show the result of checks using github action errors',
      false
    )
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
          githubAnnotations: boolean;
        }) => {
          const checkService = rulesetServices[options.ruleset];
          if (!checkService) {
            throw new UserError(
              `Ruleset named ${
                options.ruleset
              } is not registered. valid options: ${JSON.stringify(
                Object.keys(rulesetServices)
              )}`
            );
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
          const parsedContext = parseContextObject(options.context);

          const { waitUntilExit } = render(
            <Compare
              verbose={options.verbose}
              output={options.output}
              apiCheckService={checkService}
              from={parseSpecVersion(options.from, defaultEmptySpec)}
              to={parseSpecVersion(options.to, defaultEmptySpec)}
              context={parsedContext}
              shouldGenerateFile={options.createFile}
              mapToFile={
                options.githubAnnotations
                  ? SourcemapRendererEnum.github
                  : SourcemapRendererEnum.local
              }
              projectName={projectName}
            />,
            { exitOnCtrlC: true }
          );
          await waitUntilExit();
          return Promise.resolve();
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
  mapToFile: SourcemapRendererEnum;
  projectName: string;
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
              validateOpenApiV3Document(results.jsonLike);

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
              throw new UserError(e);
            }),
          specFromInputToResults(props.to, process.cwd())
            .then((results) => {
              validateOpenApiV3Document(results.jsonLike);

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
              throw new UserError(e);
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

          trackEvent('optic_ci.compare', `${props.projectName}-optic-ci`, {
            isInCi: process.env.CI === 'true',
            numberOfErrors: results.reduce(
              (count, result) => (result.passed ? count : count + 1),
              0
            ),
            // TODO add in number of changes between openapi files
          });

          exit(
            hasError ? new UserError('Some checks did not pass') : undefined
          );
        } catch (e) {
          !isStale && setResults({ loading: false, error: e as Error });
          throw e;
        }
      } catch (e) {
        exit(e as Error);
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
        <SpecComparison
          results={results.data}
          verbose={props.verbose}
          mapToFile={props.mapToFile}
        />
      )}
      {outputFileLocation && (
        <Text>Results of this run can be found at: {outputFileLocation}</Text>
      )}
    </Box>
  );
}
