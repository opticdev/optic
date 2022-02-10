import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';

import * as DocumentedBodies from './shapes/streams/documented-bodies';
import * as ShapeDiffs from './shapes/streams/shape-diffs';
import * as Facts from './specs/streams/facts';

import {
  JsonSchemaSourcemap,
  parseOpenAPIWithSourcemap,
} from '@useoptic/openapi-io';

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

      const facts = Facts.fromOpenAPISpec(spec);
      const exampleBodies = DocumentedBodies.fromBodyExampleFacts(facts);

      // const shapeDiffs = ShapeDiffs.fromBodies(spec, exampleBodies);
    });
}
