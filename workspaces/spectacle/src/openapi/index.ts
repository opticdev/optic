import { OperationDefinitionNode } from 'graphql';
import { JsonSchema, jsonSchemaFromShapeId } from './json-schema';

export async function generateOpenApi(spectacle: any) {
  const requests = await spectacle.queryWrapper({
    query: `{
      requests {
        id
        pathId
        pathComponents {
          name
          isParameterized
        }
        absolutePathPatternWithParameterNames
        method
        bodies {
          contentType
          rootShapeId
        }
        responses {
          id
          statusCode
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
    const path = request.absolutePathPatternWithParameterNames;

    if (!(path in openapi.paths)) {
      openapi.paths[path] = {};
    }

    for (const pathComponent of request.pathComponents || []) {
      if (pathComponent.isParameterized) {
        if (!('parameters' in openapi.paths[path]))
          openapi.paths[path].parameters = [];
        openapi.paths[path].parameters?.push({
          name: pathComponent.name,
          in: 'path',
        });
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
    operation.responses[response.statusCode] = { description: '', content: {} };
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
  name: string;
  in: string;
};

type Operation = {
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
