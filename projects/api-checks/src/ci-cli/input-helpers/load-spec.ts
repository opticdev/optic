import { SpecFromInput, SpecVersionFrom } from './compare-input-parser';
import {
  JsonSchemaSourcemap,
  parseOpenAPIFromRepoWithSourcemap,
  ParseOpenAPIResult,
  inGit,
  parseOpenAPIWithSourcemap,
} from '@useoptic/openapi-io';
import path from 'path';
import { OpenAPIV3 } from 'openapi-types';

export async function specFromInputToResults(
  input: SpecFromInput,
  workingDir: string = process.cwd()
): Promise<ParseOpenAPIResult> {
  switch (input.from) {
    case SpecVersionFrom.empty: {
      const emptySpecName = 'empty.json';
      const jsonLike = {
        ...input.value,
        ['x-optic-ci-empty-spec']: true,
      } as OpenAPIV3.Document;
      const sourcemap = new JsonSchemaSourcemap(emptySpecName);
      await sourcemap.addFileIfMissingFromContents(
        emptySpecName,
        JSON.stringify(jsonLike, null, 2),
        0
      );

      return {
        jsonLike,
        sourcemap,
      };
    }
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
