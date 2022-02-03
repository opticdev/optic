import { DidLoadStatus, ISpecReader, OpenAPIDiffingQuestions } from './types';
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
import invariant from 'ts-invariant';

type LoadedResult = {
  result: ParseOpenAPIResult;
  questions: OpenAPIDiffingQuestions;
  start: number;
  end: number;
};

export function createOpenApiFileSystemReader(filePath: string): ISpecReader {
  return new FileSystemSpecReader(filePath);
}

class FileSystemSpecReader implements ISpecReader {
  constructor(private filePath: string) {
    this.reload();
  }

  private loaded?: LoadedResult;
  private isLoading: Promise<any> = Promise.resolve();

  describeLocation(): string {
    return `${this.filePath.replace(process.cwd(), '')}`;
  }

  async didLoad(): Promise<DidLoadStatus> {
    try {
      const results = await this.isLoading;
      invariant(results[0].status === 'fulfilled', results[0].reason);
      return {
        success: true,
        durationMillis: this.loaded.end - this.loaded.start,
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.message,
        durationMillis: this.loaded.end - this.loaded.start,
      };
    }
  }

  async flattenedSpecification(): Promise<OpenAPIV3.Document> {
    await this.isLoading;
    return this.loaded.result.jsonLike;
  }

  async questions(): Promise<OpenAPIDiffingQuestions> {
    await this.isLoading;
    return this.loaded.questions;
  }

  async reload(): Promise<void> {
    const start = Date.now();
    this.loaded = undefined;
    const loadResult = new Promise<LoadedResult>(async (resolve, reject) => {
      try {
        const checkIfExists = await fs.pathExists(this.filePath);
        if (checkIfExists) {
          const parsed = await parseOpenAPIWithSourcemap(this.filePath);
          resolve({
            result: parsed,
            start,
            end: Date.now(),
            questions: openApiQueries(parsed.jsonLike),
          });
        } else {
          if (isYaml(this.filePath)) {
            await fs.writeFile(this.filePath, writeYaml(defaultEmptySpec));
          } else if (isJson(this.filePath)) {
            await fs.writeFile(
              this.filePath,
              JSON.stringify(defaultEmptySpec, null, 2)
            );
          } else {
            reject('openapi file must be .json or .yaml');
          }
          const parsed = await parseOpenAPIWithSourcemap(this.filePath);
          resolve({
            result: parsed,
            start,
            end: Date.now(),
            questions: openApiQueries(parsed.jsonLike),
          });
        }
      } catch (e: any) {
        reject(e.message);
      }
    });
    this.isLoading = Promise.allSettled([loadResult]);
    this.loaded = await loadResult;
    return;
  }

  rootFile(): string {
    return this.filePath;
  }

  async save(patch: IFilePatch): Promise<void> {
    await Promise.all(
      patch.files.map(async (i) => fs.writeFile(i.path, i.newContents))
    );
  }

  async sourcemap(): Promise<JsonSchemaSourcemap> {
    await this.isLoading;
    return this.loaded.result.sourcemap;
  }

  mode: 'simulated' | 'filesystem' = 'filesystem';
}
