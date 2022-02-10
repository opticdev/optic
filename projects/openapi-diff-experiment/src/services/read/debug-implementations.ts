import {
  DidLoadStatus,
  FilePathsWithChanges,
  ISpecReader,
  OpenAPIDiffingQuestions,
} from './types';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { IFilePatch } from '../patch/types';
import { openApiQueries } from './queries';
import { JsonSchemaSourcemap } from '@useoptic/openapi-io';

export const defaultEmptySpec: OpenAPIV3.Document = {
  openapi: '3.0.1',
  info: { version: '0.0.0', title: 'Empty' },
  paths: {},
};

export class PassThroughSpecReader implements ISpecReader {
  private _loadedPromise: Promise<{
    flattened: OpenAPIV3.Document;
    sourcemap: JsonSchemaSourcemap;
  }>;

  private readonly _mainOpenApiFile: string;

  mode: 'simulated';

  constructor(openApi: OpenAPIV3.Document = defaultEmptySpec) {
    this._mainOpenApiFile = 'openapi.json';

    const createMock = async () => {
      const mock = new JsonSchemaSourcemap(this._mainOpenApiFile);
      await mock.addFileIfMissingFromContents(
        this._mainOpenApiFile,
        JSON.stringify(openApi, null, 2),
        0
      );
      return { flattened: openApi, sourcemap: mock };
    };

    this._loadedPromise = createMock();
  }

  async sourcemap(): Promise<any> {
    const { sourcemap } = await this._loadedPromise;
    return sourcemap;
  }

  describeLocation(): string {
    return 'an in-memory OpenAPI simulation';
  }

  async didLoad(): Promise<DidLoadStatus> {
    await this._loadedPromise;
    return Promise.resolve({ success: true, durationMillis: 1 });
  }

  async flattenedSpecification(): Promise<OpenAPIV3.Document> {
    const { flattened } = await this._loadedPromise;
    return flattened;
  }

  async reload() {
    return Promise.resolve();
  }

  async questions(): Promise<OpenAPIDiffingQuestions> {
    const { flattened } = await this._loadedPromise;
    return openApiQueries(flattened);
  }

  async save(patch: IFilePatch): Promise<void> {
    const file = patch.files.find((i) => i.path === this._mainOpenApiFile)!;

    const createMock = async () => {
      const mock = new JsonSchemaSourcemap(this._mainOpenApiFile);
      await mock.addFileIfMissingFromContents(
        this._mainOpenApiFile,
        file.newContents,
        0
      );
      return { flattened: JSON.parse(file.newContents), sourcemap: mock };
    };

    this._loadedPromise = createMock();
  }

  rootFile(): string {
    return this._mainOpenApiFile;
  }
}
