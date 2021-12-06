import React, { useEffect } from 'react';
import { SpecFromInput } from '../../input-helpers/compare-input-parser';
import { Box, Text, useApp, useStdout } from 'ink';
import { useAsync, useAsyncFn } from 'react-use';
import { AsyncState } from 'react-use/lib/useAsyncFn';
import { ApiCheckService } from '../../../sdk/api-check-service';
import { SpecComparison } from './components';
import { specFromInputToResults } from '../../input-helpers/load-spec';
import { generateSpecResults } from './utils';

export function Compare<T>(props: {
  from: SpecFromInput;
  to: SpecFromInput;
  context: T;
  verbose: boolean;
  output: 'pretty' | 'json' | 'plain';
  apiCheckService: ApiCheckService<T>;
}) {
  const stdout = useStdout();
  const loadFrom = useAsync(
    async () => await specFromInputToResults(props.from, process.cwd())
  );
  const loadTo = useAsync(
    async () => await specFromInputToResults(props.to, process.cwd())
  );

  const specsLoaded = !loadFrom.loading && !loadFrom.loading;

  const [results, sendCheckRequest] = useAsyncFn(async () => {
    return generateSpecResults(
      props.apiCheckService,
      loadFrom.value!,
      loadTo.value!,
      props.context
    );
  }, [loadFrom, loadTo, props.context]);

  const { exit } = useApp();

  useEffect(() => {
    if (loadFrom.error || loadTo.error) {
      setTimeout(() => exit(), 200);
    }
  }, [loadFrom, loadTo]);

  useEffect(() => {
    if (results.value && results.value.some((i) => !i.passed)) {
      setTimeout(() => {
        exit();
        console.log('\n');
        process.exit(1);
      }, 200);
    }
  }, [results.value]);

  const errorLoadingSpec = loadFrom.error || loadTo.error;

  const loadStatus = (spec: string, promise: AsyncState<any>) => {
    return (
      <Text color="white">
        {spec} specification:{' '}
        {promise.loading && (
          <Text color="green" bold>
            loading...
          </Text>
        )}
        {promise.error && (
          <Text color="red" bold>
            {promise.error.message.split('\n')[0]}
          </Text>
        )}
        {!promise.loading && !promise.error && (
          <Text color="green" bold>
            done
          </Text>
        )}
      </Text>
    );
  };

  useEffect(() => {
    if (specsLoaded) sendCheckRequest();
  }, [loadFrom, loadTo]);

  if (props.output == 'json') {
    if (results.value) {
      const filteredResults = props.verbose
        ? results.value
        : results.value.filter((x) => !x.passed);
      stdout.write(JSON.stringify(filteredResults, null, 2));
    }
    return null;
  }

  return (
    <Box flexDirection="column" width={process.env.COLUMNS || '5000'}>
      <Text color="blue" bold>
        Loading specifications for comparison:
      </Text>

      {loadStatus('Current', loadFrom)}
      {loadStatus('Next', loadTo)}

      {errorLoadingSpec && (
        <Text color="red">
          Stopping. Could not load two specifications to compare
        </Text>
      )}
      {specsLoaded && results.loading && (
        <>
          <Text>running rules...</Text>
        </>
      )}
      {results.value && (
        <SpecComparison results={results.value} verbose={props.verbose} />
      )}
    </Box>
  );
}
