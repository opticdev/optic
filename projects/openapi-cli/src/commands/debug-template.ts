import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';

import { OpenAPIV3, SpecTemplate, applyTemplate } from '../workflows';

export function registerDebugTemplateCommand(cli: Command) {
  cli
    .command('debug-template', { hidden: true }) // temporary debugging only
    .usage('openapi.yml')
    .argument(
      '<openapi-file>',
      'an OpenAPI spec file to debug template against'
    )
    .description('debug a template')
    .action(async (specPath) => {
      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return cli.error('OpenAPI specification file could not be found');
      }

      const template = SpecTemplate.create(
        'add-resource-schema',
        exampleAddResourceSchema
      );

      await applyTemplate(template, absoluteSpecPath, {
        modelName: 'TestModel',
      });
    });
}

function exampleAddResourceSchema(
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
