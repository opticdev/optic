import {
  ConceptualLocation,
  OpenApiKind,
  OpenApiHeaderFact,
  OpenApiRequestParameterFact,
  OpenApiBodyFact,
  OpenApiFieldFact,
  OpenApiOperationFact,
  OpenApiResponseFact,
  FactAccumulator,
  Traverse,
  OpenApiFact,
  OperationLocation,
  ResponseHeaderLocation,
  ResponseLocation,
  PathParameterLocation,
  HeaderParameterLocation,
  BodyLocation,
  QueryParameterLocation,
  FieldLocation,
} from '../../sdk/types';
import { IPathComponent } from '../../sdk/types';
import invariant from 'ts-invariant';
import { jsonPointerHelpers as jsonPointer } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3 } from 'openapi-types';

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

const isNotReferenceObject = <T extends {}>(
  maybeReference: T | OpenAPIV3.ReferenceObject
): maybeReference is Exclude<T, OpenAPIV3.ReferenceObject> => {
  return !('$ref' in maybeReference);
};

export class OpenAPITraverser
  implements Traverse<OpenAPIV3.Document, OpenApiFact> {
  format = 'openapi3';
  accumulator = new FactAccumulator<OpenApiFact>([]);

  input: OpenAPIV3.Document | undefined = undefined;

  traverse(input: OpenAPIV3.Document): void {
    this.input = input;
    Object.entries(input.paths).forEach(([pathPattern, paths]) => {
      const traverseIfPresent = (method: OpenAPIV3.HttpMethods) => {
        const pathObject = paths?.[method];
        if (pathObject) {
          this.traverseOperations(pathObject, method, pathPattern, {
            method: method,
            path: pathPattern,
          });
        }
      };
      traverseIfPresent(OpenAPIV3.HttpMethods.GET);
      traverseIfPresent(OpenAPIV3.HttpMethods.PATCH);
      traverseIfPresent(OpenAPIV3.HttpMethods.POST);
      traverseIfPresent(OpenAPIV3.HttpMethods.PUT);
      traverseIfPresent(OpenAPIV3.HttpMethods.DELETE);
      traverseIfPresent(OpenAPIV3.HttpMethods.HEAD);
      traverseIfPresent(OpenAPIV3.HttpMethods.OPTIONS);
    });
  }

  traverseOperations(
    operation: OpenAPIV3.OperationObject,
    method: string,
    pathPattern: string,
    location: OperationLocation
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
    const requestBody = operation.requestBody;
    if (requestBody) {
      if (isNotReferenceObject(requestBody)) {
        Object.entries(requestBody.content || {}).forEach(
          ([contentType, body]) => {
            this.traverseBody(
              body,
              contentType,
              jsonPointer.append(
                jsonPath,
                'requestBody',
                'content',
                contentType
              ),
              [...conceptualPath, contentType],
              { ...location, inRequest: { body: { contentType } } }
            );
          }
        );
      } else {
        console.warn(
          `Expected a flattened spec, found a reference at: ${conceptualPath.join(
            ' > '
          )}`
        );
      }
    }

    Object.entries(operation.responses).forEach(([statusCode, response]) => {
      if (isNotReferenceObject(response)) {
        this.traverseResponse(
          response,
          statusCode,
          jsonPointer.append(jsonPath, 'responses', statusCode),
          [...conceptualPath, 'responses', statusCode],
          { ...location, inResponse: { statusCode } }
        );
      } else {
        console.warn(
          `Expected a flattened spec, found a reference at: ${conceptualPath.join(
            ' > '
          )}`
        );
      }
    });
  }

  traverseResponse(
    response: OpenAPIV3.ResponseObject,
    statusCode: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ResponseLocation
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
            statusCode: location.inResponse.statusCode,
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
    location: OperationLocation
  ) {
    const locationForParameter = (parameter: OpenAPIV3.ParameterObject) => {
      let paramLocation:
        | PathParameterLocation
        | QueryParameterLocation
        | HeaderParameterLocation;

      if (parameter.in === 'query') {
        paramLocation = { ...location, inRequest: { query: parameter.name } };
      } else if (parameter.in === 'header') {
        paramLocation = {
          ...location,
          inRequest: { header: parameter.name },
        };
      } else if (parameter.in === 'path') {
        paramLocation = { ...location, inRequest: { path: parameter.name } };
      } else {
        // @todo add cookie
        console.warn('Found a parameter that was not handled');
        return;
      }

      return paramLocation;
    };

    if (operation.parameters) {
      this.checkJsonTrail(jsonPath, operation.parameters);
      operation.parameters.forEach((parameter, i) => {
        if (isNotReferenceObject(parameter)) {
          const location = locationForParameter(parameter);
          if (location) {
            this.onRequestParameter(
              parameter,
              jsonPointer.append(jsonPath, i.toString()),
              [...conceptualPath, parameter.in, parameter.name],
              location
            );
          }
        } else {
          console.warn(
            `Expected a flattened spec, found a reference at: ${conceptualPath.join(
              ' > '
            )}`
          );
        }
      });
    }

    const sharedParametersPointer = jsonPointer.compile([
      'paths',
      location.path,
      'parameters',
    ]);

    const sharedParameters = jsonPointer.tryGet(
      this.input,
      sharedParametersPointer
    );

    if (sharedParameters.match) {
      const shared = sharedParameters.value as OpenAPIV3.ParameterObject[];
      shared.forEach((parameter, i) => {
        const location = locationForParameter(parameter);
        if (location) {
          this.onRequestParameter(
            parameter,
            jsonPointer.append(sharedParametersPointer, i.toString()),
            [...conceptualPath, parameter.in, parameter.name],
            location
          );
        }
      });
    }
  }
  onRequestParameter(
    parameter: OpenAPIV3.ParameterObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location:
      | PathParameterLocation
      | QueryParameterLocation
      | HeaderParameterLocation
  ) {
    this.checkJsonTrail(jsonPath, parameter);
    const value: OpenApiRequestParameterFact = {
      ...parameter,
    };
    switch (parameter.in) {
      case 'query':
        return this.accumulator.log({
          location: {
            jsonPath,
            conceptualPath,
            kind: OpenApiKind.QueryParameter,
            conceptualLocation: location as QueryParameterLocation,
          },
          value,
        });
      case 'header':
        return this.accumulator.log({
          location: {
            jsonPath,
            conceptualPath,
            kind: OpenApiKind.HeaderParameter,
            conceptualLocation: location as HeaderParameterLocation,
          },
          value,
        });
      case 'path':
        return this.accumulator.log({
          location: {
            jsonPath,
            conceptualPath,
            kind: OpenApiKind.PathParameter,
            conceptualLocation: location as PathParameterLocation,
          },
          value,
        });
    }
  }

  traverseResponseHeaders(
    response: OpenAPIV3.ResponseObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ResponseLocation
  ) {
    if (response.headers) {
      Object.entries(response.headers).forEach(([name, header]) => {
        if (isNotReferenceObject(header)) {
          this.onResponseHeader(
            name,
            header,
            jsonPointer.append(jsonPath, 'headers', name),
            [...conceptualPath, 'headers', name],
            {
              ...location,
              inResponse: {
                statusCode: location.inResponse.statusCode,
                header: name,
              },
            }
          );
        } else {
          console.warn(
            `Expected a flattened spec, found a reference at: ${conceptualPath.join(
              ' > '
            )}`
          );
        }
      });
    }
  }

  onResponseHeader(
    name: string,
    header: OpenAPIV3.HeaderObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ResponseHeaderLocation
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
    location: BodyLocation
  ) {
    this.checkJsonTrail(jsonPath, body);
    const schema = body.schema;
    if (!schema) {
      return;
    }
    if (isNotReferenceObject(schema)) {
      this.onContentForBody(
        schema,
        contentType,
        jsonPath,
        conceptualPath,
        location
      );
      this.traverseSchema(
        schema,
        jsonPointer.append(jsonPath, 'schema'),
        conceptualPath,
        {
          ...location,
          jsonSchemaTrail: [],
        }
      );
    } else {
      console.warn(
        `Expected a flattened spec, found a reference at: ${conceptualPath.join(
          ' > '
        )}`
      );
    }
  }

  traverseField(
    key: string,
    schema: OpenAPIV3.SchemaObject,
    required: boolean,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: FieldLocation
  ) {
    this.checkJsonTrail(jsonPath, schema);
    this.onField(key, schema, required, jsonPath, conceptualPath, location);
    this.traverseSchema(schema, jsonPath, conceptualPath, location);
  }

  // TODO discriminate between ArraySchemaObject | NonArraySchemaObject
  traverseSchema(
    schema: OpenAPIV3.SchemaObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: FieldLocation
  ) {
    this.checkJsonTrail(jsonPath, schema);
    if (schema.oneOf || schema.anyOf || schema.allOf) {
      // iterate these, multiple branches at path
    }
    switch (schema.type) {
      case 'object':
        Object.entries(schema.properties || {}).forEach(
          ([key, fieldSchema]) => {
            if (isNotReferenceObject(fieldSchema)) {
              this.traverseField(
                key,
                fieldSchema,
                (schema.required || []).includes(key),
                jsonPointer.append(jsonPath, 'properties', key),
                [...conceptualPath, key],
                {
                  ...location,
                  jsonSchemaTrail: [...(location.jsonSchemaTrail || []), key],
                }
              );
            } else {
              console.warn(
                `Expected a flattened spec, found a reference at: ${conceptualPath.join(
                  ' > '
                )}`
              );
            }
          }
        );
        break;
      case 'array':
        const arrayItems = schema.items;
        if (isNotReferenceObject(arrayItems)) {
          this.traverseSchema(
            arrayItems,
            jsonPointer.append(jsonPath, 'items'),
            [...conceptualPath, 'items'],
            {
              ...location,
              jsonSchemaTrail: [...(location.jsonSchemaTrail || []), 'items'],
            }
          );
        } else {
          console.warn(
            `Expected a flattened spec, found a reference at: ${conceptualPath.join(
              ' > '
            )}`
          );
        }
        break;
      case 'string':
      case 'number':
      case 'integer':
        break;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////

  getSchemaWithoutNestedThings(
    schema: OpenAPIV3.SchemaObject
  ): Omit<OpenAPIV3.SchemaObject, 'item' | 'required' | 'properties'> {
    if (schema.type === 'array') {
      const {
        items,
        required,
        properties,
        ...schemaWithoutNestedThings
      } = schema;
      return schemaWithoutNestedThings;
    } else {
      const { required, properties, ...schemaWithoutNestedThings } = schema;
      return schemaWithoutNestedThings;
    }
  }

  onContentForBody(
    schema: OpenAPIV3.SchemaObject,
    contentType: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: BodyLocation
  ) {
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
    location: FieldLocation
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
    operation: OpenAPIV3.OperationObject
  ): Omit<OpenAPIV3.OperationObject, 'parameters' | 'responses'> {
    const {
      parameters,
      responses,
      ...operationWithoutNestedThings
    } = operation;
    return operationWithoutNestedThings;
  }

  onOperation(
    operation: OpenAPIV3.OperationObject,
    pathPattern: string,
    method: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: OperationLocation
  ) {
    this.checkJsonTrail(jsonPath, operation);
    const flatOperation = this.getOperationWithoutNestedThings(operation);
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
    location: ResponseLocation
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
    return responseWithoutNestedThings;
  }

  // helper

  checkJsonTrail<G>(jsonPath: string, mustShareIdentity: G) {
    invariant(
      jsonPointer.get(this.input!, jsonPath.toString()) === mustShareIdentity,
      `json trail is not being set properly at ${jsonPath}`
    );
  }
}
