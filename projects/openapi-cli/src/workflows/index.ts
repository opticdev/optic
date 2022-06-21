import {
  readDeferencedSpec,
  SpecFile,
  SpecFiles,
  SpecPatch,
  SpecPatches,
  SpecFileOperations,
  SpecFileOperation,
  SpecTemplate,
  OpenAPIV3,
} from '../specs';
import invariant from 'ts-invariant';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  flushEvents,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';
import { tap } from '../lib/async-tools';

export { SpecTemplate, OpenAPIV3 };

export async function createSpecFile<T>(
  absoluteFilePath: string,
  info: OpenAPIV3.InfoObject
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
  const specPatches = SpecPatches.generateForNewSpec(info);

  const fileOperations = SpecFileOperations.fromNewFilePatches(
    newSpecFile.path,
    specPatches
  );

  const updatedSpecFiles = SpecFiles.patch([newSpecFile], fileOperations);

  for await (let _writtenFilePath of SpecFiles.writeFiles(updatedSpecFiles)) {
  }

  trackEvent(
    'openapi_cli.workflows.spec_file_created',
    'openapi_cli', // TODO: determine more useful userId
    {}
  );

  try {
    await flushEvents();
  } catch (err) {
    console.warn('Could not flush usage analytics (non-critical)');
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
  const { jsonLike: spec, sourcemap } = (
    await readDeferencedSpec(absoluteSpecPath)
  ).unwrap();

  const stats = {
    patchesCount: 0,
    updatedFilesCount: 0,
    filesWithOverwrittenYamlComments: new Set<string>(),
  };
  const observers = {
    observePatchces: tap<SpecPatch>((specPatch) => {
      stats.patchesCount++;
    }),
    observeFileOperations: tap<SpecFileOperation>((op) => {
      const file = specFiles.find(({ path }) => path === op.filePath);
      if (file && SpecFile.containsYamlComments(file))
        stats.filesWithOverwrittenYamlComments.add(file.path);
    }),
    observeUpdatedFiles: tap<SpecFile>((_file) => {
      stats.updatedFilesCount++;
    }),
  };

  const specFiles = [...SpecFiles.fromSourceMap(sourcemap)];

  const specPatches = observers.observePatchces(
    SpecPatches.generateByTemplate(spec, template, options)
  );

  const fileOperations = observers.observeFileOperations(
    SpecFileOperations.fromSpecPatches(specPatches, sourcemap)
  );

  const updatedSpecFiles = observers.observeUpdatedFiles(
    SpecFiles.patch(specFiles, fileOperations)
  );

  for await (let _writtenFilePath of SpecFiles.writeFiles(updatedSpecFiles)) {
  }

  trackEvent(
    'openapi_cli.workflows.template_applied',
    'openapi_cli', // TODO: determine more useful userId
    {
      templateName: template.name,
      patchesCount: stats.patchesCount,
      updatedFilesCount: stats.updatedFilesCount,
      filesWithOverwrittenYamlCommentsCount:
        stats.filesWithOverwrittenYamlComments.size,
    }
  );

  try {
    await flushEvents();
  } catch (err) {
    console.warn('Could not flush usage analytics (non-critical)');
  }
}
