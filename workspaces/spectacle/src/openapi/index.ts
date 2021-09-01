import { OperationDefinitionNode } from 'graphql';
import { JsonSchema, jsonSchemaFromShapeId } from './json-schema';

export async function generateOpenApi(spectacle: any) {
  const requests = await spectacle.queryWrapper({
    query: `{
      requests {
        isRemoved
        id
        pathId
        pathComponents {
          name
          isParameterized
          contributions
        }
        absolutePathPatternWithParameterNames
        pathContributions
        requestContributions
        method
        bodies {
          contentType
          rootShapeId
        }
        responses {
          id
          statusCode
          contributions
          bodies {
            contentType
            rootShapeId
          }
        }
      }
    }`,
    variables: {},
  });

  const openapi: OpenApi = {
    openapi: '3.0.3',
    info: {
      title: 'Optic Generated OpenAPI',
      version: '1.0.0',
    },
    paths: {},
  };

  for (const request of requests.data.requests) {
    if (request.isRemoved) {
      continue;
    }
    const path = request.absolutePathPatternWithParameterNames;

    if (!(path in openapi.paths)) {
      openapi.paths[path] = {};
    }

    for (const pathComponent of request.pathComponents || []) {
      if (pathComponent.isParameterized) {
        if (!('parameters' in openapi.paths[path]))
          openapi.paths[path].parameters = [];

        const pathParam: Parameter = {
          name: pathComponent.name,
          in: 'path',
          schema: {
            type: 'string',
          },
          required: true,
        };

        if ('description' in pathComponent.contributions) {
          pathParam.description = pathComponent.contributions.description;
        }

        openapi.paths[path].parameters?.push(pathParam);
      }
    }

    switch (request.method) {
      case 'GET':
        openapi.paths[path].get = await buildOperation(spectacle, request);
        break;
      case 'POST':
        openapi.paths[path].post = await buildOperation(spectacle, request);
        break;
      case 'PUT':
        openapi.paths[path].put = await buildOperation(spectacle, request);
        break;
      case 'PATCH':
        openapi.paths[path].patch = await buildOperation(spectacle, request);
        break;
      case 'DELETE':
        openapi.paths[path].delete = await buildOperation(spectacle, request);
        break;
    }
  }

  return openapi;
}

async function buildOperation(
  spectacle: any,
  request: any
): Promise<Operation> {
  const operation: Operation = {};
  if ('summary' in request.pathContributions) {
    operation.summary = request.pathContributions.purpose;
  }
  if ('description' in request.pathContributions) {
    operation.description = request.pathContributions.description;
  }
  for (const requestBody of request.bodies || []) {
    if (!operation.requestBody) operation.requestBody = { content: {} };
    const schema = await jsonSchemaFromShapeId(
      spectacle,
      requestBody.rootShapeId
    );
    operation.requestBody.content[requestBody.contentType] = { schema };
  }
  for (const response of request.responses || []) {
    if (!operation.responses) operation.responses = {};
    const description =
      'description' in response.contributions
        ? response.contributions.description
        : '';
    operation.responses[response.statusCode] = { description, content: {} };
    for (const responseBody of response.bodies || []) {
      const schema = await jsonSchemaFromShapeId(
        spectacle,
        responseBody.rootShapeId
      );
      operation.responses[response.statusCode].content[
        responseBody.contentType
      ] = { schema };
    }
  }
  return operation;
}

type OpenApi = {
  openapi: '3.0.3';
  info: {
    title: string;
    version: string;
  };
  paths: {
    [property: string]: PathItem;
  };
};

type PathItem = {
  parameters?: Parameter[];
  get?: Operation;
  post?: Operation;
  put?: Operation;
  patch?: Operation;
  delete?: Operation;
};

type Parameter = {
  description?: string;
  name: string;
  in: string;
  schema: {
    type: 'string';
  };
  required: true;
};

type Operation = {
  summary?: string;
  description?: string;
  requestBody?: {
    content: {
      [property: string]: MediaType;
    };
  };
  responses?: {
    [property: string]: {
      description: '';
      content: {
        [property: string]: MediaType;
      };
    };
  };
};

type MediaType = {
  schema: JsonSchema;
};
