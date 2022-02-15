import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';

import { tap } from './lib/async-tools';
import * as DocumentedBodies from './shapes/streams/documented-bodies';
import * as ShapeDiffs from './shapes/streams/shape-diffs';
import * as Facts from './specs/streams/facts';

import {
  JsonSchemaSourcemap,
  parseOpenAPIWithSourcemap,
} from '@useoptic/openapi-io';
import { diffBodyBySchema, observeBodyShape } from './shapes';

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

      for await (let { body, schema, bodyLocation } of exampleBodies) {
        let shapeDiff;
        if (schema) {
          shapeDiff = diffBodyBySchema(body, schema).next().value;
        }

        if (shapeDiff) {
          let observationResults = observeBodyShape(body);
          console.log(
            'learned example shape',
            bodyLocation,
            last(observationResults)
          );
        }
      }

      // const shapeDiffs = logger(ShapeDiffs.fromDocumentedBodies(exampleBodies));
    });
}

function last<T>(iter: Iterable<T>): T {
  let last;
  for (let item of iter) {
    last = item;
  }
  return last;
}
