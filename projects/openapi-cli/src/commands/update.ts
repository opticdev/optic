import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';

import { tap, concat } from '../lib/async-tools';
import {
  SpecFacts,
  SpecFile,
  SpecFileOperation,
  readDeferencedSpec,
} from '../specs';
import { DocumentedBodies, ShapePatches, SchemaObject } from '../shapes';
import {
  SpecFileOperations,
  SpecPatch,
  SpecPatches,
  SpecFiles,
  BodyExampleFact,
  ComponentSchemaExampleFact,
} from '../specs';

import { DocumentedBody } from '../shapes/body';
import { flushEvents, trackEvent } from '../segment';
import { ComponentSchemaExampleFacts } from '../specs/streams/facts';

export function updateCommand(): Command {
  const command = new Command('update');

  command
    .usage('openapi.yml')
    .argument('<openapi-file>', 'an OpenAPI spec file to update')
    .description(
      'update an OpenAPI specification from examples or observed traffic'
    )
    .action(async (specPath) => {
      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return command.error('OpenAPI specification file could not be found');
      }

      const { jsonLike: spec, sourcemap } = await readDeferencedSpec(
        absoluteSpecPath
      );
      const specFiles = [...SpecFiles.fromSourceMap(sourcemap)];

      const logger = tap(console.log.bind(console));

      const stats = {
        examplesCount: 0,
        externalExamplesCount: 0,
        patchesCount: 0,
        updatedFilesCount: 0,
        filesWithOverwrittenYamlComments: new Set<string>(),

        observeBodyExamples: tap<BodyExampleFact>((exampleFact) => {
          stats.examplesCount++;
          if (exampleFact.value.externalValue) stats.externalExamplesCount++;
        }),
        observeComponentSchemaExamples: tap<ComponentSchemaExampleFact>(
          (_exampleFact) => {
            stats.examplesCount++;
          }
        ),
        observePatches: tap<SpecPatch>((_patch) => {
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

      const facts = SpecFacts.fromOpenAPISpec(spec);
      const bodyExampleFacts = stats.observeBodyExamples(
        SpecFacts.bodyExamples(facts)
      );
      const componentExampleFacts = stats.observeComponentSchemaExamples(
        SpecFacts.componentSchemaExamples(facts)
      );

      const exampleBodies = concat(
        DocumentedBodies.fromComponentSchemaExampleFacts(
          componentExampleFacts,
          spec
        )
      );

      const specPatches = (async function* (documentedBodies): SpecPatches {
        const updatedSchemasByPath: Map<string, SchemaObject> = new Map();

        for await (let documentedBody of documentedBodies) {
          let { specJsonPath, shapeLocation } = documentedBody;

          if (updatedSchemasByPath.has(specJsonPath)) {
            documentedBody.schema = updatedSchemasByPath.get(specJsonPath)!;
          }

          for (let patch of ShapePatches.generateBodyAdditions(
            documentedBody
          )) {
            documentedBody = DocumentedBody.applyShapePatch(
              documentedBody,
              patch
            );
            yield SpecPatch.fromShapePatch(patch, specJsonPath, shapeLocation!);
          }

          updatedSchemasByPath.set(specJsonPath, documentedBody.schema!);
        }
      })(exampleBodies);

      // additions only, so we only safely extend the spec
      const specAdditions = stats.observePatches(
        SpecPatches.additions(specPatches)
      );

      const fileOperations = stats.observeFileOperations(
        SpecFileOperations.fromSpecPatches(specAdditions, sourcemap)
      );

      const updatedSpecFiles = stats.observeUpdatedFiles(
        SpecFiles.patch(specFiles, fileOperations)
      );

      for await (let writtenFilePath of SpecFiles.writeFiles(
        updatedSpecFiles
      )) {
        console.log(`Updated ${writtenFilePath}`);
      }

      console.log(
        `✅ Applied ${stats.patchesCount} patch${
          stats.patchesCount === 1 ? '' : 'es'
        } to ${stats.updatedFilesCount} file${
          stats.updatedFilesCount === 1 ? '' : 's'
        } generated from ${stats.examplesCount} example${
          stats.examplesCount === 1 ? '' : 's'
        }`
      );

      await trackEvent(
        'openapi_cli.spec_updated_by_example',
        'openapi_cli', // TODO: determine more useful userId
        {
          examplesCount: stats.examplesCount,
          externalExamplesCount: stats.externalExamplesCount,
          patchesCount: stats.patchesCount,
          updatedFilesCount: stats.updatedFilesCount,
          filesWithOverwrittenYamlCommentsCount:
            stats.filesWithOverwrittenYamlComments.size,
        }
      );

      await flushEvents();
    });

  return command;
}
