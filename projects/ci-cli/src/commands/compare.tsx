import { useEffect } from "react";
import React from "react";
import * as path from "path";
import { inGit } from "@useoptic/openapi-utilities/build/loaders/file-on-branch";
import {
  SpecFromInput,
  SpecVersionFrom,
} from "../input-helpers/compare-input-parser";
import { render, Text, useApp } from "ink";

import {
  parseOpenAPIFromRepoWithSourcemap,
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from "@useoptic/openapi-utilities/build/parser/openapi-sourcemap-parser";
import { useAsync } from "react-use";

export function Compare(props: {
  from: SpecFromInput;
  to: SpecFromInput;
  rules: string;
}) {
  const loadFrom = useAsync(
    async () => await specFromInputToResults(props.from, process.cwd())
  );
  const loadTo = useAsync(
    async () => await specFromInputToResults(props.from, process.cwd())
  );

  const { exit } = useApp();

  useEffect(() => {
    if (!loadFrom.loading && !loadTo.loading) {
      setTimeout(() => exit(), 200);
    }
  }, [loadFrom, loadTo]);

  return (
    <>
      <Text color="green">
        is loading from spec {loadFrom.loading.toString()}
      </Text>
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
        sourcemap: { files: [], map: [] },
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
