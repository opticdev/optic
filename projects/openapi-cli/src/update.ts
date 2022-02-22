import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';

import { tap } from './lib/async-tools';
import { SpecFacts, SpecFile } from './specs';
import { DocumentedBodies, ShapePatches } from './shapes';
import { SpecFileOperations, SpecPatch, SpecPatches, SpecFiles } from './specs';

import { parseOpenAPIWithSourcemap } from '@useoptic/openapi-io';

export function registerUpdateCommand(cli: Command) {
  cli
    .command('update')
    .usage('openapi.yml')
    .argument('<openapi-file>', 'an OpenAPI spec file to update')
    .description(
      'update an OpenAPI specification from examples or observed traffic'
    )
    .action(async (specPath) => {
      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return cli.error('OpenAPI specification file could not be found');
      }

      const { jsonLike: spec, sourcemap } = await parseOpenAPIWithSourcemap(
        absoluteSpecPath
      );
      const specFiles = SpecFiles.fromSourceMap(sourcemap);

      const logger = tap(console.log.bind(console));

      const stats = {
        patchesCount: 0,
        updatedFilesCount: 0,

        observePatches: tap<SpecPatch>((_patch) => {
          stats.patchesCount++;
        }),
        observeUpdatedFiles: tap<SpecFile>((_file) => {
          stats.updatedFilesCount++;
        }),
      };

      const facts = SpecFacts.fromOpenAPISpec(spec);
      const exampleBodies = DocumentedBodies.fromBodyExampleFacts(facts, spec);

      const specPatches = (async function* (documentedBodies): SpecPatches {
        for await (let documentedBody of documentedBodies) {
          let { specJsonPath, bodyLocation } = documentedBody;

          for (let patch of ShapePatches.generateByDiffingBody(
            documentedBody
          )) {
            yield SpecPatch.fromShapePatch(patch, specJsonPath, bodyLocation);
          }
        }
      })(exampleBodies);

      // additions only, so we only safely extend the spec
      const specAdditions = stats.observePatches(
        SpecPatches.additions(specPatches)
      );

      const fileOperations = SpecFileOperations.fromSpecPatches(
        specAdditions,
        sourcemap
      );

      const updatedSpecFiles = stats.observeUpdatedFiles(
        SpecFiles.patch(specFiles, fileOperations)
      );

      for await (let writtenFilePath of SpecFiles.flushToFiles(
        updatedSpecFiles
      )) {
        console.log(`Updated ${writtenFilePath}`);
      }

      console.log(
        `✅ Applied ${stats.patchesCount} patche${
          stats.patchesCount === 1 ? '' : 's'
        } to ${stats.updatedFilesCount} file${
          stats.updatedFilesCount === 1 ? '' : 's'
        }`
      );
    });
}
