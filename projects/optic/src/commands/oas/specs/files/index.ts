import { JsonSchemaSourcemap, isYaml } from '@useoptic/openapi-io';
import { PatchOperation } from '../../patches';
import { applyPatch } from './reconcilers';
import { Readable, Writable } from 'stream';

export { JsonSchemaSourcemap as SpecFilesSourcemap };

export interface SpecFile {
  path: string;
  contents: string;
}

export class SpecFile {
  static create(path: string): SpecFile {
    return { path, contents: '' };
  }

  static async applyPatch(
    self: SpecFile,
    operations: PatchOperation[]
  ): Promise<SpecFile> {
    const result = await applyPatch(self.path, self.contents, operations);

    if (!result.success) {
      throw new Error(`could not patch spec file: ${result.error}`);
    }

    return {
      path: self.path,
      contents: result.contents,
    };
  }

  static isYaml(self: SpecFile): boolean {
    return isYaml(self.path);
  }

  static write(self: SpecFile, destination: Writable): Writable {
    return Readable.from(self.contents).pipe(destination);
  }
}

const yamlCommentsPattern = /(^|[\s])#.*\n?/;

export type SpecFilePatchResult = {
  success: true;
};

export interface SpecFileOperation {
  filePath: string;
  operation: PatchOperation;
}
