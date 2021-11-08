import { useEffect } from "react";
import React from "react";
import * as path from "path";
import { inGit } from "@useoptic/openapi-utilities/build/loaders/file-on-branch";
import {
  SpecFromInput,
  SpecVersionFrom,
} from "../input-helpers/compare-input-parser";
import { render, Text, Newline, useApp, Box } from "ink";

import {
  JsonSchemaSourcemap,
  parseOpenAPIFromRepoWithSourcemap,
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from "@useoptic/openapi-utilities/build/parser/openapi-sourcemap-parser";
import { useAsync, useAsyncFn } from "react-use";
import { AsyncState } from "react-use/lib/useAsyncFn";
import { ApiCheckService } from "../../sdk/api-check-service";
import { RenderCheckResults } from "./render-results";
import { sourcemapReader } from "@useoptic/openapi-utilities";
import { ResultWithSourcemap } from "../../sdk/types";

export function Compare<T>(props: {
  from: SpecFromInput;
  to: SpecFromInput;
  context: T;
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
    <>
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
        <Box marginTop={1}>
          <RenderCheckResults results={results.value || []} />
        </Box>
      )}
    </>
  );
}

async function specFromInputToResults(
  input: SpecFromInput,
  workingDir: string = process.cwd()
): Promise<ParseOpenAPIResult> {
  switch (input.from) {
    case SpecVersionFrom.empty:
      return {
        jsonLike: input.value,
        sourcemap: new JsonSchemaSourcemap(),
      };
    case SpecVersionFrom.git: {
      const gitRepo = await inGit(path.join(workingDir, input.name));
      if (!gitRepo) {
        throw new Error(`${input.name} is not in a git repo`);
      }
      return await parseOpenAPIFromRepoWithSourcemap(
        input.name,
        gitRepo,
        input.branch
      );
    }
    case SpecVersionFrom.file:
      return await parseOpenAPIWithSourcemap(input.filePath);
  }
}
