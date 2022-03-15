import {
  readDeferencedSpec,
  SpecFile,
  SpecFiles,
  SpecPatches,
  SpecFileOperations,
  SpecTemplate,
  OpenAPIV3,
} from '../specs';
import invariant from 'ts-invariant';
import * as fs from 'fs-extra';
import * as path from 'path';

export { SpecTemplate, OpenAPIV3 };

export async function createSpecFile<T>(
  absoluteFilePath: string,
  info: OpenAPIV3.InfoObject,
  template: SpecTemplate<T>,
  options: T
) {
  invariant(
    absoluteFilePath.indexOf('/') === 0,
    'createSpecFile requires an absolute path for a new spec file'
  );
  let dirPath = path.dirname(absoluteFilePath);
  invariant(
    await fs.pathExists(dirPath),
    `path ${dirPath} must exist to create a new spec file at ${absoluteFilePath}`
  );

  const newSpecFile = SpecFile.create(absoluteFilePath);
  const specPatches = SpecPatches.generateForNewSpec(info, template, options);

  const fileOperations = SpecFileOperations.fromNewFilePatches(
    newSpecFile.path,
    specPatches
  );

  const updatedSpecFiles = SpecFiles.patch([newSpecFile], fileOperations);

  for await (let _writtenFilePath of SpecFiles.writeFiles(updatedSpecFiles)) {
  }
}

export async function applyTemplate<T>(
  template: SpecTemplate<T>,
  absoluteSpecPath: string,
  options: T
): Promise<void> {
  invariant(
    absoluteSpecPath.indexOf('/') === 0,
    'applyTemplate requires an absolute path to the spec file'
  );
  const { jsonLike: spec, sourcemap } = await readDeferencedSpec(
    absoluteSpecPath
  );
  const specFiles = [...SpecFiles.fromSourceMap(sourcemap)];

  const specPatches = SpecPatches.generateByTemplate(spec, template, options);

  const fileOperations = SpecFileOperations.fromSpecPatches(
    specPatches,
    sourcemap
  );

  const updatedSpecFiles = SpecFiles.patch(specFiles, fileOperations);

  for await (let _writtenFilePath of SpecFiles.writeFiles(updatedSpecFiles)) {
  }
}
