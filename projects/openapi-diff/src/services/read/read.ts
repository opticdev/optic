import { ISpecReader, OpenAPIDiffingQuestions } from './types';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { openApiQueries } from './queries';
import { IFilePatch } from '../patch/types';
import fs from 'fs-extra';
import { defaultEmptySpec } from './debug-implementations';
import {
  isJson,
  isYaml,
  JsonSchemaSourcemap,
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
  writeYaml,
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
        if (isYaml(filePath)) {
          await fs.writeFile(filePath, writeYaml(defaultEmptySpec));
          return resolve(await parseOpenAPIWithSourcemap(filePath));
        } else if (isJson(filePath)) {
          await fs.writeFile(
            filePath,
            JSON.stringify(defaultEmptySpec, null, 2)
          );
          return resolve(await parseOpenAPIWithSourcemap(filePath));
        } else throw new Error('OpenAPI filepath must end in .json or .yaml');
      }
    });

    result.finally(() => {
      end = Date.now();
    });

    questionsPromise = result.then((parsed) => openApiQueries(parsed.jsonLike));
  }

  reload();

  return {
    reload: async (): Promise<void> => {
      reload();
      await result;
    },
    rootFile(): string {
      return filePath;
    },
    mode: 'filesystem',
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
    sourcemap: async (): Promise<JsonSchemaSourcemap> => {
      const { sourcemap } = await result;
      return sourcemap;
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
    questions: async (): Promise<OpenAPIDiffingQuestions> => {
      return questionsPromise;
    },
  };
}
