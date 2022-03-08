import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';

import {
  SpecFiles,
  OpenAPIV3,
  SpecPatches,
  SpecFileOperations,
} from '../specs';
import { parseOpenAPIWithSourcemap } from '@useoptic/openapi-io';

export function registerDebugPluginCommand(cli: Command) {
  cli
    .command('debug-plugin', { hidden: true }) // temporary debugging only
    .usage('openapi.yml')
    .argument('<openapi-file>', 'an OpenAPI spec file to debug plugin against')
    .description('debug a plugin')
    .action(async (specPath) => {
      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return cli.error('OpenAPI specification file could not be found');
      }

      const { jsonLike: spec, sourcemap } = await parseOpenAPIWithSourcemap(
        absoluteSpecPath
      );
      const specFiles = [...SpecFiles.fromSourceMap(sourcemap)];

      const specPatches = SpecPatches.generateByUpdatePlugin(
        spec,
        exampleAddResourceSchema,
        { modelName: 'TestModel' }
      );

      const fileOperations = SpecFileOperations.fromSpecPatches(
        specPatches,
        sourcemap
      );

      const updatedSpecFiles = SpecFiles.patch(specFiles, fileOperations);

      for await (let writtenFilePath of SpecFiles.writeFiles(
        updatedSpecFiles
      )) {
        console.log(`Updated ${writtenFilePath}`);
      }
    });
}

async function exampleAddResourceSchema(
  spec: OpenAPIV3.Document,
  options: { modelName: string },
  _context: {}
) {
  const { modelName } = options;
  if (!spec.components) spec.components = {};
  if (!spec.components.schemas) spec.components.schemas = {};
  spec.components.schemas[`${modelName}Attributes`] = {
    type: 'object',
    properties: {},
  };
  spec.components.schemas[`${modelName}Resource`] = {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      type: {},
      attributes: { $ref: `#/components/schemas/${modelName}Attributes` },
      relationships: { $ref: `#/components/schemas/${modelName}Relationships` },
    },
    additionalProperties: false,
  };
  spec.components.schemas[`${modelName}Relationships`] = {
    type: 'object',
    properties: {},
    additionalProperties: false,
  };
  spec.components.schemas[`${modelName}Collection`] = {
    type: 'array',
    items: { $ref: `#/components/schemas/${modelName}Resource` },
  };
  spec.components.schemas[`${modelName}CollectionResponse`] = {
    type: 'object',
    properties: {
      jsonapi: {},
      data: {},
      links: {},
    },
  };
  spec.components.schemas[`${modelName}ResourceResponse`] = {
    properties: {
      jsonapi: {},
      data: { $ref: `#/components/schemas/${modelName}Resource` },
      links: {},
    },
  };
}
