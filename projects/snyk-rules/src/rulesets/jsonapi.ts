import * as fs from 'fs';
import * as path from 'path';
import YAML from 'js-yaml';
import { SnykApiCheckDsl } from '../dsl';
import { OpenAPIV3 } from 'openapi-types';
import Ajv from 'ajv';
import { expect } from 'chai';

const ajv = new Ajv();

function getOperationName(operation) {
  return `operation ${operation.pathPattern} ${operation.method}`;
}

function getResponseName(response, context) {
  return `response ${context.path} ${context.method} ${response.statusCode}`;
}

function isOpenApiPath(path) {
  return path.match(/\/openapi/);
}

function loadSchemaFromFile(filename) {
  const fullFilename = path.join(__dirname, '..', '..', 'schemas', filename);
  return YAML.load(fs.readFileSync(fullFilename, 'utf-8'));
}

export const rules = {
  statusCodes: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must(
      'support the correct status codes',
      (operation, context, docs, specItem) => {
        if (isOpenApiPath(context.path)) return;

        const operationName = getOperationName(operation);
        const statusCodes = Object.keys(specItem.responses);

        // Ensure only supported 4xx are used
        const allowed4xxStatusCodes = [
          '400',
          '401',
          '403',
          '404',
          '409',
          '429',
        ];
        const statusCodes4xx = statusCodes.filter((statusCode) =>
          statusCode.startsWith('4')
        );
        for (const statusCode4xx of statusCodes4xx) {
          expect(
            allowed4xxStatusCodes,
            `expected ${operationName} to not support ${statusCode4xx}`
          ).to.include(statusCode4xx);
        }

        // Ensure delete supports correct 2xx status codes
        if (operation.method === 'delete') {
          const statusCodes2xx = statusCodes.filter((statusCode) =>
            statusCode.startsWith('2')
          );
          for (const statusCode2xx of statusCodes2xx) {
            expect(
              ['200', '204'],
              `expected ${operationName} to not support ${statusCode2xx}`
            ).to.include(statusCode2xx);
          }
        }

        // Ensure delete supports correct 2xx status codes
        if (operation.method === 'post') {
          const statusCodes2xx = statusCodes.filter((statusCode) =>
            statusCode.startsWith('2')
          );
          for (const statusCode2xx of statusCodes2xx) {
            expect(
              ['201'],
              `expected ${operationName} to not support ${statusCode2xx}`
            ).to.include(statusCode2xx);
          }
        }
      }
    );
  },
  contentType: ({ responses }: SnykApiCheckDsl) => {
    responses.requirement.must(
      'use the JSON:API content type',
      (response, context, docs, specItem) => {
        if (isOpenApiPath(context.path) || response.statusCode === '204')
          return;
        const contentTypes = Object.keys(specItem.content);
        expect(
          contentTypes,
          `expected ${getResponseName(
            response,
            context
          )} to support application/vnd.api+json`
        ).to.include('application/vnd.api+json');
      }
    );
  },
  responseData: ({ responses }: SnykApiCheckDsl) => {
    responses.requirement.must(
      'use the correct JSON:API response data',
      (response, context, docs, specItem) => {
        if (isOpenApiPath(context.path)) return;

        const responseName = getResponseName(response, context);

        // Patch response requires schema
        if (context.method === 'patch' && response.statusCode === '200') {
          expect(
            specItem.content['application/vnd.api+json']?.schema?.properties,
            `expected ${responseName} to have a schema`
          ).to.exist;
        }

        // Empty patch 204 content
        if (
          ['delete', 'patch'].includes(context.method) &&
          response.statusCode === '204'
        ) {
          expect(
            specItem.content,
            `expected ${responseName} to not have content`
          ).to.not.exist;
        }

        // Non-204 status codes must have content
        if (response.statusCode !== '204') {
          expect(specItem.content, `expected ${responseName} to have content`)
            .to.not.exist;
        }

        // JSON:API data property
        if (
          ['get', 'post'].includes(context.method) &&
          ['200', '201'].includes(response.statusCode)
        ) {
          expect(
            specItem.content['application/vnd.api+json']?.schema?.properties
              ?.data?.type,
            `expected ${responseName} to have data property`
          ).to.exist;
        }

        // JSON:API jsonapi property
        if (
          !['patch', 'delete'].includes(context.method) &&
          ['200', '201'].includes(response.statusCode)
        ) {
          expect(
            specItem.content['application/vnd.api+json']?.schema?.properties
              ?.jsonapi?.type?.data?.type,
            `expected ${responseName} to have a JSON:API property`
          ).to.exist;
        }

        // Success post responses
        if (context.method === 'post' && response.statusCode === '201') {
          // Location header
          expect(
            specItem.headers,
            `expected ${responseName} to have a location header`
          ).to.have.property('location');
          // Self link
          expect(
            specItem.content['application/vnd.api+json']?.schema?.properties
              ?.data?.properties?.links?.properties?.self,
            `expected ${responseName} to have a self link`
          ).to.exist;
        }
      }
    );
  },
  selfLinks: ({ responses }: SnykApiCheckDsl) => {
    responses.requirement.must(
      'include self links',
      (response, context, docs, specItem) => {
        if (isOpenApiPath(context.path)) return;

        // Top-level self links
        if (
          (['get', 'patch'].includes(context.method) &&
            response.statusCode === '200') ||
          (context.method === 'post' && response.statusCode === '201')
        ) {
          expect(
            specItem.content['application/vnd.api+json']?.schema?.properties
              ?.links?.properties?.self,
            `expected ${getResponseName(response, context)} to have a self link`
          ).to.exist;
        }
      }
    );
  },
  pagination: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must(
      'correctly support pagination',
      (operation, context, docs, specItem) => {
        if (isOpenApiPath(context.path)) return;

        const operationName = getOperationName(operation);

        const paginationParameters = [
          'starting_after',
          'ending_before',
          'limit',
        ];
        const parameterNames = ((specItem.parameters ||
          []) as OpenAPIV3.ParameterObject[]).map((parameter) => {
          return parameter.name;
        });
        if (!operation.pathPattern.match(/\{[a-z]*?_?id\}$/)) {
          if (operation.method === 'get') {
            // Require pagination parameters
            for (const paginationParameterName of paginationParameters) {
              expect(
                parameterNames,
                `expected ${operationName} to include ${paginationParameterName} parameter`
              ).to.include(paginationParameterName);
            }
            // Require pagination links
            const response = specItem.responses['200'];
            if (!('$ref' in response)) {
              const schema =
                response.content?.['application/vnd.api+json']?.schema || {};
              if (!('$ref' in schema)) {
                expect(
                  schema.properties?.links,
                  `expected ${operationName} to have pagination links`
                ).to.exist;
              }
            }
          }
        } else {
          if (operation.method !== 'get') {
            for (const paginationParameterName of paginationParameters) {
              expect(
                parameterNames,
                `expected ${operationName} to not include ${paginationParameterName} parameter`
              ).to.not.include(paginationParameterName);
            }
          }
        }
      }
    );
  },
  compoundDocuments: ({ responses }: SnykApiCheckDsl) => {
    responses.requirement.must(
      'not allow compound documents',
      (response, context, docs, specItem) => {
        if (isOpenApiPath(context.path)) return;
        if (['200', '201'].includes(response.statusCode)) {
          expect(
            specItem.content['application/vnd.api+json']?.schema?.properties
              ?.included,
            `expected ${getResponseName(
              response,
              context
            )} to not support compound documents`
          ).to.not.exist;
        }
      }
    );
  },
  schemas: ({ responses }: SnykApiCheckDsl) => {
    responses.requirement.must(
      'have valid JSON:API schemas',
      (response, context, docs, specItem) => {
        if (isOpenApiPath(context.path)) return;

        // Response data
        if (
          ['get', 'post'].includes(context.method) &&
          ['200', '201'].includes(response.statusCode)
        ) {
          const responseSchema =
            specItem.content?.['application/vnd.api+json']?.schema;
          const schema: any = loadSchemaFromFile('get-post-response-data.yaml');
          const validate = ajv.compile(schema);
          expect(
            validate(responseSchema),
            `expected ${getResponseName(
              response,
              context
            )} schema to be valid response data`
          ).to.be.true;
        }

        // Patch response data
        if (context.method === 'patch' && response.statusCode === '200') {
          const responseSchema =
            specItem.content?.['application/vnd.api+json']?.schema;
          const schema: any = loadSchemaFromFile('patch-response-data.yaml');
          const validate = ajv.compile(schema);
          expect(
            validate(responseSchema),
            `expected ${getResponseName(
              response,
              context
            )} schema to be valid response data`
          ).to.be.true;
        }

        // Delete response data
        if (context.method === 'delete' && response.statusCode === '200') {
          const responseSchema =
            specItem.content?.['application/vnd.api+json']?.schema;
          const schema: any = loadSchemaFromFile('delete-response-data.yaml');
          const validate = ajv.compile(schema);
          expect(
            validate(responseSchema),
            `expected ${getResponseName(
              response,
              context
            )} schema to be valid response data`
          ).to.be.true;
        }

        // Relationships
        const relationships =
          specItem.content?.['application/vnd.api+json']?.schema?.properties
            ?.data?.properties?.relationships;
        if (relationships) {
          const schema: any = loadSchemaFromFile('relationship.yaml');
          const validate = ajv.compile(schema);
          expect(
            validate(relationships),
            `expected ${getResponseName(
              response,
              context
            )} schema to have valid relationships`
          ).to.be.true;
        }
      }
    );
  },
};
