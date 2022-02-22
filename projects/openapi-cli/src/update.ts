import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';

import { tap } from './lib/async-tools';
import { SpecFacts } from './specs';
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
      const specAdditions = SpecPatches.additions(specPatches);

      const fileOperations = SpecFileOperations.fromSpecPatches(
        specAdditions,
        sourcemap
      );
      const updatedSpecFiles = SpecFiles.patch(specFiles, fileOperations);

      await SpecFiles.flushToFiles(updatedSpecFiles);
    });
}
