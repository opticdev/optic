import { ISpecReader, OpenAPIDiffingQuestions } from './types';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { openApiQueries } from './queries';
import { IFilePatch } from '../patch/types';
import fs from 'fs-extra';
import { defaultEmptySpec } from './debug-implementations';
import {
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from '@useoptic/openapi-io';

export function createOpenApiFileSystemReader(filePath: string): ISpecReader {
  const start = Date.now();
  let end = Date.now();
  let result: Promise<ParseOpenAPIResult> | undefined;

  let questionsPromise: Promise<OpenAPIDiffingQuestions> | undefined;

  function reload() {
    result = new Promise(async (resolve) => {
      const checkIfExists = await fs.pathExists(filePath);
      if (checkIfExists) {
        return resolve(await parseOpenAPIWithSourcemap(filePath));
      } else {
        await fs.writeJSON(filePath, defaultEmptySpec);
        return resolve(await parseOpenAPIWithSourcemap(filePath));
      }
    });

    result.finally(() => {
      end = Date.now();
    });

    questionsPromise = result.then((parsed) => openApiQueries(parsed.jsonLike));
  }

  reload();

  return {
    rootFile(): string {
      return filePath;
    },
    describeLocation(): string {
      return `${filePath.replace(process.cwd(), '')}`;
    },
    save: async (patch: IFilePatch): Promise<void> => {
      await Promise.all(
        patch.files.map(async (i) => fs.writeFile(i.path, i.newContents))
      );
      reload();
    },
    flattenedSpecification: async (): Promise<OpenAPIV3.Document> => {
      const { jsonLike } = await result;
      return jsonLike;
    },
    didLoad: async () => {
      // wait for it to finish
      await new Promise((resolve) => {
        result.finally(() => resolve(undefined));
      });

      try {
        await result;
        return { success: true, durationMillis: end - start };
      } catch (e: any) {
        return {
          success: false,
          error: e.message,
          durationMillis: end - start,
        };
      }
    },
    isStale: async () => {
      return false; // @todo checksum dependencies
    },
    questions: async (): Promise<OpenAPIDiffingQuestions> => {
      return questionsPromise;
    },
  };
}
