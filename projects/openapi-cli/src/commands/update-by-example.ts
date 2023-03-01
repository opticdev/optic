import { Command } from 'commander';
import { Ok, Err, Result } from 'ts-results';
import Path from 'path';
import fs from 'fs-extra';

import { tap, forkable, merge } from '../lib/async-tools';
import {
  SpecFacts,
  SpecFile,
  SpecFileOperation,
  SpecFileOperations,
  SpecFiles,
  SpecFilesAsync,
  SpecPatch,
  SpecPatches,
  BodyExampleFact,
  ComponentSchemaExampleFact,
  readDeferencedSpec,
} from '../specs';
import { DocumentedBodies } from '../shapes';
import { flushEvents, trackEvent } from '../segment';

export function updateByExampleCommand(): Command {
  const command = new Command('update');

  command
    .usage('openapi.yml')
    .argument('<openapi-file>', 'an OpenAPI spec file to update')
    .description(
      'update an OpenAPI specification from examples or observed traffic'
    )
    .action(async (specPath) => {
      const updateResult = await updateByExample(specPath);

      if (updateResult.err) {
        return command.error(updateResult.val);
      }

      let { stats, results: updatedSpecFiles } = updateResult.val;

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

      trackEvent('openapi_cli.spec_updated_by_example', {
        examplesCount: stats.examplesCount,
        externalExamplesCount: stats.externalExamplesCount,
        patchesCount: stats.patchesCount,
        updatedFilesCount: stats.updatedFilesCount,
        filesWithOverwrittenYamlCommentsCount:
          stats.filesWithOverwrittenYamlComments.size,
      });

      try {
        await flushEvents();
      } catch (err) {
        console.warn('Could not flush usage analytics (non-critical)');
      }
    });

  return command;
}

export async function updateByExample(specPath: string): Promise<
  Result<
    {
      stats: {
        examplesCount: number;
        externalExamplesCount: number;
        patchesCount: number;
        updatedFilesCount: number;
        filesWithOverwrittenYamlComments: Set<string>;
      };
      results: SpecFilesAsync;
    },
    string
  >
> {
  const absoluteSpecPath = Path.resolve(specPath);
  if (!(await fs.pathExists(absoluteSpecPath))) {
    return Err('OpenAPI specification file could not be found');
  }

  const { jsonLike: spec, sourcemap } = (
    await readDeferencedSpec(absoluteSpecPath)
  ).unwrap();
  const specFiles = [...SpecFiles.fromSourceMap(sourcemap)];

  const stats = {
    examplesCount: 0,
    externalExamplesCount: 0,
    patchesCount: 0,
    updatedFilesCount: 0,
    filesWithOverwrittenYamlComments: new Set<string>(),
  };
  const observers = {
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
    observeFileOperations: tap<SpecFileOperation>((op) => {}),
    observeUpdatedFiles: tap<SpecFile>((_file) => {
      stats.updatedFilesCount++;
    }),
  };

  const facts = forkable(SpecFacts.fromOpenAPISpec(spec));
  const bodyExampleFacts = observers.observeBodyExamples(
    SpecFacts.bodyExamples(facts.fork())
  );
  const componentExampleFacts = observers.observeComponentSchemaExamples(
    SpecFacts.componentSchemaExamples(facts.fork())
  );
  facts.start();

  const exampleBodies = merge(
    DocumentedBodies.fromBodyExampleFacts(bodyExampleFacts, spec),
    DocumentedBodies.fromComponentSchemaExampleFacts(
      componentExampleFacts,
      spec
    )
  );

  // const capturedBodies = // combined from matched bodies and new bodies generated from patches?

  const bodyPatches = SpecPatches.shapeAdditions(spec, exampleBodies);

  // additions only, so we only safely extend the spec
  const specAdditions = observers.observePatches(
    SpecPatches.additions(bodyPatches)
  );

  const fileOperations = observers.observeFileOperations(
    SpecFileOperations.fromSpecPatches(specAdditions, sourcemap)
  );

  const updatedSpecFiles = observers.observeUpdatedFiles(
    SpecFiles.patch(specFiles, fileOperations)
  );

  return Ok({
    stats,
    results: updatedSpecFiles,
  });
}
