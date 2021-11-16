import React, { useEffect } from "react";
import { SpecFromInput } from "../../input-helpers/compare-input-parser";
import { Box, Newline, Text, useApp } from "ink";
import { useAsync, useAsyncFn } from "react-use";
import { AsyncState } from "react-use/lib/useAsyncFn";
import { ApiCheckService } from "../../../sdk/api-check-service";
import { RenderCheckResults } from "./render-results";
import { sourcemapReader } from "@useoptic/openapi-io";
import { ResultWithSourcemap } from "../../../sdk/types";
import { specFromInputToResults } from "../../input-helpers/load-spec";

export function Compare<T>(props: {
  from: SpecFromInput;
  to: SpecFromInput;
  context: T;
  verbose: boolean;
  apiCheckService: ApiCheckService<T>;
}) {
  const loadFrom = useAsync(
    async () => await specFromInputToResults(props.from, process.cwd())
  );
  const loadTo = useAsync(
    async () => await specFromInputToResults(props.to, process.cwd())
  );

  const specsLoaded = !loadFrom.loading && !loadFrom.loading;

  const [results, sendCheckRequest] = useAsyncFn(async () => {
    const checkResults = await props.apiCheckService.runRules(
      loadFrom.value!.jsonLike!,
      loadTo.value!.jsonLike!,
      props.context
    );

    const { findFileAndLines } = sourcemapReader(loadTo.value!.sourcemap);
    return await Promise.all(
      checkResults.map(async (checkResult) => {
        return {
          ...checkResult,
          sourcemap: await findFileAndLines(
            checkResult.change.location.jsonPath
          ),
        } as ResultWithSourcemap;
      })
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
        console.log("\n");
        process.exit(1);
      }, 200);
    }
  }, [results.value]);

  const errorLoadingSpec = loadFrom.error || loadTo.error;

  const loadStatus = (spec: string, promise: AsyncState<any>) => {
    return (
      <Text color="white">
        {spec} specification:{" "}
        {promise.loading && (
          <Text color="green" bold>
            loading...
          </Text>
        )}
        {promise.error && (
          <Text color="red" bold>
            {promise.error.message.split("\n")[0]}
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

  return (
    <Box flexDirection="column">
      <Text color="blue" bold>
        Loading specifications for comparison:
      </Text>

      {loadStatus("Current", loadFrom)}
      {loadStatus("Next", loadTo)}

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
        <Box flexDirection="column">
          <Newline />
          <RenderCheckResults
            results={results.value || []}
            verbose={props.verbose}
          />
          <Box alignItems="flex-start" flexDirection="column" marginTop={3}>
            <Text bold color="green">
              {results.value.filter((i) => i.passed).length} checks passed
              {props.verbose && results.value.some((i) => i.passed) && (
                <Text color="grey">
                  {" "}
                  run with --verbose flag to see results
                </Text>
              )}
            </Text>
            <Text bold color="red">
              {results.value.filter((i) => !i.passed).length} checks failed
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
