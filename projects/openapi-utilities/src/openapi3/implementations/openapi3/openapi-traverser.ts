import {
  ConceptualLocation,
  FactAccumulator,
  IPathComponent,
  OpenApiBodyFact,
  OpenApiFact,
  OpenApiFieldFact,
  OpenApiHeaderFact,
  OpenApiKind,
  OpenApiOperationFact,
  OpenApiRequestParameterFact,
  OpenApiResponseFact,
  Traverse,
} from '../../sdk/types';
import invariant from 'ts-invariant';
import {
  jsonPointerHelpers,
  jsonPointerHelpers as jsonPointer,
} from '@useoptic/json-pointer-helpers';
import { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';

export function normalizeOpenApiPath(path: string): string {
  return path
    .split('/')
    .map((pathComponent) => {
      if (pathComponent.startsWith('{') && pathComponent.endsWith('}')) {
        return '{}';
      }
      return pathComponent;
    })
    .join('/');
}

export class OpenAPITraverser
  implements Traverse<OpenAPIV3.Document, OpenApiFact>
{
  format = 'openapi3';
  accumulator = new FactAccumulator<OpenApiFact>([]);

  input: OpenAPIV3.Document | undefined = undefined;

  traverse(input: OpenAPIV3.Document): void {
    this.input = input;
    Object.entries(input.paths).forEach(([pathPattern, paths]) => {
      const traverseIfPresent = (method: OpenAPIV3.HttpMethods) => {
        if (paths && paths[method]) {
          this.traverseOperations(paths[method]!, method, pathPattern, {
            method: method,
            path: pathPattern,
          });
        }
      };
      traverseIfPresent(OpenAPIV3.HttpMethods.GET);
      traverseIfPresent(OpenAPIV3.HttpMethods.POST);
      traverseIfPresent(OpenAPIV3.HttpMethods.PUT);
      traverseIfPresent(OpenAPIV3.HttpMethods.DELETE);
      traverseIfPresent(OpenAPIV3.HttpMethods.PATCH);
      traverseIfPresent(OpenAPIV3.HttpMethods.HEAD);
      traverseIfPresent(OpenAPIV3.HttpMethods.OPTIONS);
    });
  }

  traverseOperations(
    operation: OpenAPIV3.OperationObject,
    method: string,
    pathPattern: string,
    location: ConceptualLocation
  ): void {
    const jsonPath = jsonPointer.append('', 'paths', pathPattern, method);
    this.checkJsonTrail(jsonPath, operation);
    const normalizedPath = normalizeOpenApiPath(pathPattern);
    const conceptualPath = ['operations', normalizedPath, method];
    this.onOperation(
      operation,
      pathPattern,
      method,
      jsonPath,
      conceptualPath,
      location
    );

    this.traverseParameters(
      operation,
      jsonPointer.append(jsonPath, 'parameters'),
      [...conceptualPath, 'parameters'],
      location
    );

    if (operation.requestBody) {
      const requestBody = operation.requestBody as OpenAPIV3.RequestBodyObject;
      Object.entries(requestBody.content || {}).forEach(
        ([contentType, body]) => {
          this.traverseBody(
            body,
            contentType,
            jsonPointer.append(jsonPath, 'requestBody', 'content', contentType),
            [...conceptualPath, contentType],
            { ...location, inRequest: { body: { contentType } } }
          );
        }
      );
    }

    Object.entries(operation.responses).forEach(([statusCode, response]) => {
      this.traverseResponse(
        response as OpenAPIV3.ResponseObject,
        statusCode,
        jsonPointer.append(jsonPath, 'responses', statusCode),
        [...conceptualPath, 'responses', statusCode],
        { ...location, inResponse: { statusCode } }
      );
    });
  }

  traverseResponse(
    response: OpenAPIV3.ResponseObject,
    statusCode: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ConceptualLocation
  ): void {
    this.traverseResponseHeaders(response, jsonPath, conceptualPath, location);
    this.checkJsonTrail(jsonPath, response);

    Object.entries(response.content || {}).forEach(([contentType, body]) => {
      this.traverseBody(
        body,
        contentType,
        jsonPointer.append(jsonPath, 'content', contentType),
        [...conceptualPath, contentType],
        {
          ...location,
          inResponse: {
            statusCode: location.inResponse!.statusCode,
            body: { contentType },
          },
        }
      );
    });

    this.onResponse(response, statusCode, jsonPath, conceptualPath, location);
  }

  traverseParameters(
    operation: OpenAPIV3.OperationObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ConceptualLocation
  ) {
    const locationForParameter = (parameter: OpenAPIV3.ParameterObject) => {
      if (parameter.in === 'query')
        return { ...location, inRequest: { query: parameter.name } };
      if (parameter.in === 'header')
        return { ...location, inRequest: { header: parameter.name } };
      if (parameter.in === 'path')
        return { ...location, inRequest: { path: parameter.name } };
      // @todo add cookie
      return location;
    };

    if (operation.parameters) {
      this.checkJsonTrail(jsonPath, operation.parameters);
      operation.parameters.forEach((p, i) => {
        const parameter = p as OpenAPIV3.ParameterObject;
        this.onRequestParameter(
          parameter,
          jsonPointer.append(jsonPath, i.toString()),
          [...conceptualPath, parameter.in, parameter.name],
          locationForParameter(parameter)
        );
      });
    }

    const sharedParametersPointer = jsonPointer.compile([
      'paths',
      location.path,
      'parameters',
    ]);

    const sharedParameters = jsonPointerHelpers.tryGet(
      this.input,
      sharedParametersPointer
    );

    if (sharedParameters.match) {
      const shared = sharedParameters.value as OpenAPIV3.ParameterObject[];
      shared.forEach((p, i) => {
        const parameter = p as OpenAPIV3.ParameterObject;
        this.onRequestParameter(
          parameter,
          jsonPointer.append(sharedParametersPointer, i.toString()),
          [...conceptualPath, parameter.in, parameter.name],
          locationForParameter(parameter)
        );
      });
    }
  }
  onRequestParameter(
    parameter: OpenAPIV3.ParameterObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ConceptualLocation
  ) {
    this.checkJsonTrail(jsonPath, parameter);
    const value: OpenApiRequestParameterFact = {
      ...parameter,
    };

    const inToType = (() => {
      switch (parameter.in) {
        case 'query':
          return OpenApiKind.QueryParameter;
        case 'header':
          return OpenApiKind.HeaderParameter;
        case 'path':
          return OpenApiKind.PathParameter;
        default:
          return;
      }
    })();

    if (inToType) {
      this.accumulator.log({
        location: {
          jsonPath,
          conceptualPath,
          kind: inToType,
          conceptualLocation: location,
        },
        value,
      });
    }
  }

  traverseResponseHeaders(
    response: OpenAPIV3.ResponseObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ConceptualLocation
  ) {
    if (response.headers) {
      Object.entries(response.headers).forEach(([name, value]) => {
        const header = value as OpenAPIV3.HeaderObject;
        this.onResponseHeader(
          name,
          header,
          jsonPointer.append(jsonPath, 'headers', name),
          [...conceptualPath, 'headers', name],
          {
            ...location,
            inResponse: {
              statusCode: location.inResponse!.statusCode,
              header: name,
            },
          }
        );
      });
    }
  }

  onResponseHeader(
    name: string,
    header: OpenAPIV3.HeaderObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ConceptualLocation
  ) {
    this.checkJsonTrail(jsonPath, header);
    const value: OpenApiHeaderFact = {
      name,
      ...header,
    };
    this.accumulator.log({
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.ResponseHeader,
        conceptualLocation: location,
      },
      value,
    });
  }

  traverseLinks() {}

  traverseBody(
    body: OpenAPIV3.MediaTypeObject,
    contentType: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ConceptualLocation
  ) {
    this.checkJsonTrail(jsonPath, body);
    //@TODO: not sure if we need to check the body.schema key count
    if (body.schema && Object.keys(body.schema).length) {
      this.onContentForBody(
        body,
        contentType,
        jsonPath,
        conceptualPath,
        location
      );
      this.traverseSchema(
        body.schema as OpenAPIV3.SchemaObject,
        jsonPointer.append(jsonPath, 'schema'),
        conceptualPath,
        location
      );
    }
  }

  traverseField(
    key: string,
    schema: OpenAPIV3.SchemaObject,
    required: boolean,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ConceptualLocation
  ) {
    this.checkJsonTrail(jsonPath, schema);
    this.onField(key, schema, required, jsonPath, conceptualPath, location);
    this.traverseSchema(schema, jsonPath, conceptualPath, location);
  }

  traverseSchema(
    schema: OpenAPIV3.SchemaObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ConceptualLocation
  ) {
    this.checkJsonTrail(jsonPath, schema);
    if (schema.oneOf || schema.anyOf || schema.allOf) {
      // iterate these, multiple branches at path
    }
    switch (schema.type) {
      case 'object':
        // this.onObject(...)
        Object.entries(schema.properties || {}).forEach(([key, fieldSchema]) =>
          this.traverseField(
            key,
            fieldSchema as OpenAPIV3.SchemaObject,
            (schema.required || []).includes(key),
            jsonPointer.append(jsonPath, 'properties', key),
            [...conceptualPath, key],
            {
              ...location,
              jsonSchemaTrail: [...(location.jsonSchemaTrail || []), key],
            }
          )
        );
        break;
      case 'array':
        // this.onArray()
        this.traverseSchema(
          schema.items as OpenAPIV3.SchemaObject,
          jsonPointer.append(jsonPath, 'items'),
          [...conceptualPath, 'items'],
          {
            ...location,
            jsonSchemaTrail: [...(location.jsonSchemaTrail || []), 'items'],
          }
        );
        break;
      case 'string':
      case 'number':
      case 'integer':
        break;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////

  getSchemaWithoutNestedThings(schema: OpenAPIV3.SchemaObject) {
    //@ts-ignore
    const { items, required, properties, ...schemaWithoutNestedThings } =
      schema;
    return schemaWithoutNestedThings as OpenAPIV3.SchemaObject;
  }

  onContentForBody(
    body: OpenAPIV3.MediaTypeObject,
    contentType: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ConceptualLocation
  ) {
    const schema = body.schema! as OpenAPIV3.SchemaObject;
    const flatSchema = this.getSchemaWithoutNestedThings(schema);
    const value: OpenApiBodyFact = {
      contentType,
      flatSchema,
    };
    this.accumulator.log({
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.Body,
        conceptualLocation: location,
      },
      value,
    });
  }

  onField(
    key: string,
    schema: OpenAPIV3.SchemaObject,
    required: boolean,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ConceptualLocation
  ) {
    this.checkJsonTrail(jsonPath, schema);
    const flatSchema = this.getSchemaWithoutNestedThings(schema);

    const value: OpenApiFieldFact = {
      key,
      flatSchema,
      required,
    };
    this.accumulator.log({
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.Field,
        conceptualLocation: location,
      },
      value,
    });
  }

  getOperationWithoutNestedThings(
    operation: OpenAPIV3.OperationObject,
    location: ConceptualLocation
  ): OpenAPIV3.OperationObject {
    const { parameters, responses, ...operationWithoutNestedThings } =
      operation;
    return operationWithoutNestedThings as OpenAPIV3.OperationObject;
  }

  onOperation(
    operation: OpenAPIV3.OperationObject,
    pathPattern: string,
    method: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ConceptualLocation
  ) {
    this.checkJsonTrail(jsonPath, operation);
    const flatOperation = this.getOperationWithoutNestedThings(
      operation,
      location
    );
    const value: OpenApiOperationFact = {
      ...flatOperation,
      method,
      pathPattern,
    };
    this.accumulator.log({
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.Operation,
        conceptualLocation: location,
      },
      value,
    });
  }
  onResponse(
    response: OpenAPIV3.ResponseObject,
    statusCode: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ConceptualLocation
  ) {
    this.checkJsonTrail(jsonPath, response);
    const flatResponse = this.getResponseWithoutNestedThings(response);
    const value: OpenApiResponseFact = {
      ...flatResponse,
      statusCode: parseInt(statusCode),
    };
    this.accumulator.log({
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.Response,
        conceptualLocation: location,
      },
      value,
    });
  }
  getResponseWithoutNestedThings(
    response: OpenAPIV3.ResponseObject
  ): Omit<OpenAPIV3.ResponseObject, 'headers' | 'content'> {
    const { headers, content, ...responseWithoutNestedThings } = response;
    return responseWithoutNestedThings as OpenAPIV3.ResponseObject;
  }

  // helper

  checkJsonTrail<G>(jsonPath: string, mustShareIdentity: G) {
    invariant(
      jsonPointer.get(this.input!, jsonPath.toString()) === mustShareIdentity,
      `json trail is not being set properly at ${jsonPath}`
    );
  }
}
