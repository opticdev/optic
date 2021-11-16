import { SpecFromInput, SpecVersionFrom } from "./compare-input-parser";
import {
  JsonSchemaSourcemap,
  parseOpenAPIFromRepoWithSourcemap,
  ParseOpenAPIResult,
  inGit,
  parseOpenAPIWithSourcemap,
} from "@useoptic/openapi-io";
import path from "path";

export async function specFromInputToResults(
  input: SpecFromInput,
  workingDir: string = process.cwd()
): Promise<ParseOpenAPIResult> {
  switch (input.from) {
    case SpecVersionFrom.empty:
      return {
        jsonLike: input.value,
        sourcemap: new JsonSchemaSourcemap("empty.json"),
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
      return await parseOpenAPIWithSourcemap(
        path.resolve(workingDir, input.filePath)
      );
  }
}
