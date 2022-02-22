import { JsonSchemaSourcemap } from '@useoptic/openapi-io';
import { Operation } from '../../patches';
import { applyPatch } from './reconcilers';

export type SpecFilesSourcemap = JsonSchemaSourcemap;

export interface SpecFile {
  path: string;
  contents: string;
}

export class SpecFile {
  static async applyPatch(
    self: SpecFile,
    operations: Operation[]
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
}

export type SpecFilePatchResult = {
  success: true;
};

export interface SpecFileOperation {
  filePath: string;
  operation: Operation;
}
