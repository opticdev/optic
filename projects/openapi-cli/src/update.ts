import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';
import { inspect } from 'util';

import { tap } from './lib/async-tools';
import * as DocumentedBodies from './shapes/streams/documented-bodies';
import * as ShapeDiffs from './shapes/streams/shape-diffs';
import * as Facts from './specs/streams/facts';
import { SpecFileOperations, SpecPatch, SpecPatches } from './specs';

import {
  JsonSchemaSourcemap,
  parseOpenAPIWithSourcemap,
} from '@useoptic/openapi-io';
import { diffBodyBySchema, generateShapePatches } from './shapes';

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

      const logger = tap(console.log.bind(console));

      const facts = Facts.fromOpenAPISpec(spec);
      const exampleBodies = DocumentedBodies.fromBodyExampleFacts(facts, spec);

      const specPatches = (async function* (
        documentedBodies: AsyncIterable<DocumentedBodies.DocumentedBody>
      ): AsyncIterable<SpecPatch> {
        for await (let {
          body,
          schema,
          bodyLocation,
          specJsonPath,
        } of documentedBodies) {
          let shapeDiff;
          if (schema) {
            shapeDiff = diffBodyBySchema(body, schema).next().value; // TODO: patches for all diffs
          }

          if (schema && shapeDiff) {
            // TODO: also generate shape patches for new schemas
            let patches = generateShapePatches(shapeDiff, schema, {
              location: bodyLocation,
            });

            for (let patch of patches) {
              yield SpecPatch.fromShapePatch(patch, specJsonPath, bodyLocation);
            }
          }
        }
      })(exampleBodies);

      // additions only, so we only safely extend the spec
      const specAdditions = logger(SpecPatches.additions(specPatches));

      const fileOperations = SpecFileOperations.fromSpecPatches(
        specAdditions,
        sourcemap
      );

      for await (let fileOp of fileOperations) {
        console.log('FILE OP', inspect(fileOp, { depth: 5, colors: true }));
      }
    });
}

function last<T>(iter: Iterable<T>): T {
  let last;
  for (let item of iter) {
    last = item;
  }
  return last;
}
