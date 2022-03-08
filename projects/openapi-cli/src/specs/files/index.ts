import { JsonSchemaSourcemap, isYaml } from '@useoptic/openapi-io';
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

  static isYaml(self: SpecFile): boolean {
    return isYaml(self.path);
  }

  static containsYamlComments(self: SpecFile): boolean {
    return SpecFile.isYaml(self) && yamlCommentsPattern.test(self.contents);
  }
}

const yamlCommentsPattern = /(^|[\s])#.*\n?/;

export type SpecFilePatchResult = {
  success: true;
};

export interface SpecFileOperation {
  filePath: string;
  operation: Operation;
}
