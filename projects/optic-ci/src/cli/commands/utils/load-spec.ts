import { SpecFromInput, SpecVersionFrom } from './compare-input-parser';
import {
  JsonSchemaSourcemap,
  parseOpenAPIFromRepoWithSourcemap,
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from '@useoptic/openapi-io';
import path from 'path';
import { inGit } from '../utils/git';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export type ParseResult = ParseOpenAPIResult & { isEmptySpec: boolean };

export async function specFromInputToResults(
  input: SpecFromInput,
  workingDir: string = process.cwd()
): Promise<ParseResult> {
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
        isEmptySpec: true,
      };
    }
    case SpecVersionFrom.git: {
      const gitRepo = await inGit(workingDir);
      if (!gitRepo) {
        throw new Error(`${workingDir} is not a git repo`);
      }
      return {
        ...(await parseOpenAPIFromRepoWithSourcemap(
          input.name,
          gitRepo,
          input.branch
        )),
        isEmptySpec: false,
      };
    }
    case SpecVersionFrom.file:
      return {
        ...(await parseOpenAPIWithSourcemap(
          path.resolve(workingDir, input.filePath)
        )),
        isEmptySpec: false,
      };
  }
}
