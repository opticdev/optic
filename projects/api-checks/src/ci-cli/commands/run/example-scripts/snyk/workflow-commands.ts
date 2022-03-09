import {
  script,
  scriptWithoutOpenAPI,
} from '../../../../../scripts/define-script';
import commander from 'commander';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { writeYaml } from '@useoptic/openapi-io';
import * as fs from 'fs';
import * as path from 'path';
import { refs } from './common';
import { addCreateOperation } from './operations/create';
import { addListOperation } from './operations/list';
import { addGetOperation } from './operations/get';
import { addUpdateOperation } from './operations/update';
import { addDeleteOperation } from './operations/delete';

export const newResource = scriptWithoutOpenAPI(
  'new-resource',
  async (args) => {
    const [resourceName, pluralResourceName] = args;
    const titleResourceName = titleCase(resourceName);
    const version = getResourceVersion();
    const collectionPath = `/${pluralResourceName}`;
    const itemPath = `${collectionPath}/{${resourceName}_id}`;
    if (!fs.existsSync(path.join('.', 'resources')))
      throw new Error('Resource directory does not exist');
    await fs.mkdirSync(
      path.join('.', 'resources', pluralResourceName, version),
      { recursive: true }
    );
    const spec = buildNewResourceSpec(titleResourceName);
    const specYaml = writeYaml(spec);
    fs.writeFileSync(
      path.join('.', 'resources', pluralResourceName, version, 'spec.yaml'),
      specYaml
    );
  }
)
  .addArgument(new commander.Argument('<resource-name>', '[resource-name]'))
  .addArgument(
    new commander.Argument('<plural-resource-name>', '[plural-resource-name]')
  );

export const addOperation = script(
  'add-operation',
  async (patcher, args, flags) => {
    const [operation, resourceName, pluralResourceName] = args;
    const titleResourceName = titleCase(resourceName);
    const collectionPath = `/${pluralResourceName}`;
    const itemPath = `${collectionPath}/{${resourceName}_id}`;
    await patcher.update((spec) => {
      switch (operation) {
        case 'all':
          addCreateOperation(
            spec,
            collectionPath,
            resourceName,
            titleResourceName
          );
          addListOperation(
            spec,
            collectionPath,
            resourceName,
            titleResourceName
          );
          addGetOperation(spec, itemPath, resourceName, titleResourceName);
          addUpdateOperation(spec, itemPath, resourceName, titleResourceName);
          addDeleteOperation(spec, itemPath, resourceName, titleResourceName);
          break;
        case 'create':
          addCreateOperation(
            spec,
            collectionPath,
            resourceName,
            titleResourceName
          );
          break;
        case 'get-many':
          addListOperation(
            spec,
            collectionPath,
            resourceName,
            titleResourceName
          );
          break;
        case 'get-one':
          addGetOperation(spec, itemPath, resourceName, titleResourceName);
          break;
        case 'update':
          addUpdateOperation(spec, itemPath, resourceName, titleResourceName);
          break;
        case 'delete':
          addDeleteOperation(spec, itemPath, resourceName, titleResourceName);
          break;
      }
    });

    await patcher.flush();
  }
)
  .addArgument(new commander.Argument('<operation>', '[operation]'))
  .addArgument(new commander.Argument('<resource-name>', '[resource-name]'))
  .addArgument(
    new commander.Argument('<plural-resource-name>', '[plural-resource-name]')
  );

function buildNewResourceSpec(titleResourceName: string): OpenAPIV3.Document {
  const spec: OpenAPIV3.Document = baseOpenApiSpec(titleResourceName);
  if (!spec.components) spec.components = {};
  if (!spec.components.schemas) spec.components.schemas = {};
  spec.components.schemas[`${titleResourceName}Attributes`] = {
    type: 'object',
    properties: {},
  };
  // @ts-ignore
  spec.components['x-rest-common'] = refs.restCommon;
  return spec;
}

function baseOpenApiSpec(titleResourceName: string): OpenAPIV3.Document {
  return {
    openapi: '3.0.3',
    info: {
      title: `${titleResourceName} Resource`,
      version: '3.0.0',
    },
    servers: [
      { url: 'https://api.snyk.io/v3', description: 'Public Snyk API' },
    ],
    tags: [
      {
        name: titleResourceName,
        description: `Short description of what ${titleResourceName} represents`,
      },
    ],
    paths: {},
  };
}

//-----

function getResourceVersion(): string {
  const today = new Date();
  return `${today.getFullYear()}-${padWithZero(today.getMonth())}-${padWithZero(
    today.getUTCDay()
  )}`;
}

function padWithZero(value: number): string {
  return ('00' + value).slice(-2);
}

function titleCase(value: string): string {
  return value[0].toUpperCase() + value.slice(1);
}
