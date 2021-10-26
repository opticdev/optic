import * as path from "path";
import {inGit} from "@useoptic/openapi-utilities/build/loaders/file-on-branch";
import {SpecFromInput, SpecVersionFrom} from "../input-helpers/compare-input-parser";
import {render, Text} from 'ink';

import {
  parseOpenAPIFromRepoWithSourcemap,
  ParseOpenAPIResult, parseOpenAPIWithSourcemap
} from "@useoptic/openapi-utilities/build/parser/openapi-sourcemap-parser";

export async function compare(
  from: SpecFromInput,
  to: SpecFromInput,
  rules: string
) {
  const fromSpec = await specFromInputToResults(from, process.cwd());
  const toSpec = await specFromInputToResults(to, process.cwd());


  const Example = () => (
    <>
      <Text color="green">I am green</Text>
  <Text color="black" backgroundColor="white">
    I am black on white
  </Text>
  <Text color="#ffffff">I am white</Text>
  <Text bold>I am bold</Text>
  <Text italic>I am italic</Text>
  <Text underline>I am underline</Text>
  <Text strikethrough>I am strikethrough</Text>
  <Text inverse>I am inversed</Text>
  </>
);

  render(<Example />);

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
