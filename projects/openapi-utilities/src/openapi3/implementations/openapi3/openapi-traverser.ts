import {
  OpenApiKind,
  OpenApiRequestParameterFact,
  OpenApiFieldFact,
  OpenApiOperationFact,
  Traverse,
  OperationLocation,
  ResponseHeaderLocation,
  RequestLocation,
  ResponseLocation,
  PathParameterLocation,
  HeaderParameterLocation,
  BodyLocation,
  BodyExampleLocation,
  QueryParameterLocation,
  FieldLocation,
  ComponentSchemaLocation,
  IFact,
  FactVariant,
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

export class OpenAPITraverser implements Traverse<OpenAPIV3.Document> {
  format = 'openapi3';

  input: OpenAPIV3.Document | undefined = undefined;

  traverse(input: OpenAPIV3.Document): void {
    this.input = input;
  }

  *facts(): IterableIterator<IFact> {
    if (!this.input) return;

    for (let [pathPattern, paths] of Object.entries(this.input.paths)) {
      const traverser = this;

      const traverseIfPresent = function* (
        method: OpenAPIV3.HttpMethods
      ): IterableIterator<IFact> {
        const pathObject = paths?.[method];
        if (pathObject) {
          yield* traverser.traverseOperations(pathObject, method, pathPattern, {
            method: method,
            path: pathPattern,
          });
        }
      };

      yield* traverseIfPresent(OpenAPIV3.HttpMethods.GET);
      yield* traverseIfPresent(OpenAPIV3.HttpMethods.PATCH);
      yield* traverseIfPresent(OpenAPIV3.HttpMethods.POST);
      yield* traverseIfPresent(OpenAPIV3.HttpMethods.PUT);
      yield* traverseIfPresent(OpenAPIV3.HttpMethods.DELETE);
      yield* traverseIfPresent(OpenAPIV3.HttpMethods.HEAD);
      yield* traverseIfPresent(OpenAPIV3.HttpMethods.OPTIONS);
    }

    if (this.input.components && this.input.components.schemas) {
      for (let [name, schema] of Object.entries(
        this.input.components.schemas
      )) {
        yield* this.traverseComponentSchema(schema, name);
      }
    }
  }

  *traverseOperations(
    operation: OpenAPIV3.OperationObject,
    method: string,
    pathPattern: string,
    location: OperationLocation
  ): IterableIterator<IFact> {
    const jsonPath = jsonPointer.append('', 'paths', pathPattern, method);
    this.checkJsonTrail(jsonPath, operation);
    const normalizedPath = normalizeOpenApiPath(pathPattern);
    const conceptualPath = ['operations', normalizedPath, method];
    yield this.onOperation(
      operation,
      pathPattern,
      method,
      jsonPath,
      conceptualPath,
      location
    );

    yield* this.traverseParameters(
      operation,
      jsonPointer.append(jsonPath, 'parameters'),
      [...conceptualPath, 'parameters'],
      location
    );
    const requestBody = operation.requestBody;
    if (requestBody) {
      if (isNotReferenceObject(requestBody)) {
        for (let [contentType, body] of Object.entries(
          requestBody.content || {}
        ))
          yield* this.traverseBody(
            body,
            contentType,
            jsonPointer.append(jsonPath, 'requestBody', 'content', contentType),
            [...conceptualPath, contentType],
            { ...location, inRequest: { body: { contentType } } }
          );
        yield this.onRequest(
          requestBody,
          jsonPointer.append(jsonPath, 'requestBody'),
          [...conceptualPath, 'requestBody'],
          { ...location, inRequest: {} }
        );
      } else {
        console.warn(
          `Expected a flattened spec, found a reference at: ${conceptualPath.join(
            ' > '
          )}`
        );
      }
    }

    for (let [statusCode, response] of Object.entries(operation.responses)) {
      if (isNotReferenceObject(response)) {
        yield* this.traverseResponse(
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
    }
  }

  *traverseResponse(
    response: OpenAPIV3.ResponseObject,
    statusCode: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ResponseLocation
  ): IterableIterator<IFact> {
    yield* this.traverseResponseHeaders(
      response,
      jsonPath,
      conceptualPath,
      location
    );
    this.checkJsonTrail(jsonPath, response);

    for (let [contentType, body] of Object.entries(response.content || {})) {
      yield* this.traverseBody(
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
    }

    yield this.onResponse(
      response,
      statusCode,
      jsonPath,
      conceptualPath,
      location
    );
  }

  *traverseParameters(
    operation: OpenAPIV3.OperationObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: OperationLocation
  ): IterableIterator<IFact> {
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
      for (let [i, parameter] of Object.entries(operation.parameters)) {
        if (isNotReferenceObject(parameter)) {
          const location = locationForParameter(parameter);
          if (location) {
            let fact = this.onRequestParameter(
              parameter,
              jsonPointer.append(jsonPath, i),
              [...conceptualPath, parameter.in, parameter.name],
              location
            );
            if (fact) yield fact;
          }
        } else {
          console.warn(
            `Expected a flattened spec, found a reference at: ${conceptualPath.join(
              ' > '
            )}`
          );
        }
      }
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
      for (let [i, parameter] of Object.entries(shared)) {
        const location = locationForParameter(parameter);
        if (location) {
          let fact = this.onRequestParameter(
            parameter,
            jsonPointer.append(sharedParametersPointer, i.toString()),
            [...conceptualPath, parameter.in, parameter.name],
            location
          );
          if (fact) yield fact;
        }
      }
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
  ):
    | undefined
    | FactVariant<OpenApiKind.HeaderParameter>
    | FactVariant<OpenApiKind.PathParameter>
    | FactVariant<OpenApiKind.QueryParameter> {
    this.checkJsonTrail(jsonPath, parameter);
    const value: OpenApiRequestParameterFact = {
      ...parameter,
    };
    switch (parameter.in) {
      case 'query':
        return {
          location: {
            jsonPath,
            conceptualPath,
            kind: OpenApiKind.QueryParameter,
            conceptualLocation: location as QueryParameterLocation,
          },
          value,
        };
      case 'header':
        return {
          location: {
            jsonPath,
            conceptualPath,
            kind: OpenApiKind.HeaderParameter,
            conceptualLocation: location as HeaderParameterLocation,
          },
          value,
        };
      case 'path':
        return {
          location: {
            jsonPath,
            conceptualPath,
            kind: OpenApiKind.PathParameter,
            conceptualLocation: location as PathParameterLocation,
          },
          value,
        };
    }
  }

  *traverseResponseHeaders(
    response: OpenAPIV3.ResponseObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ResponseLocation
  ): IterableIterator<IFact> {
    if (response.headers) {
      for (let [name, header] of Object.entries(response.headers)) {
        if (isNotReferenceObject(header)) {
          yield this.onResponseHeader(
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
      }
    }
  }

  onResponseHeader(
    name: string,
    header: OpenAPIV3.HeaderObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ResponseHeaderLocation
  ): FactVariant<OpenApiKind.ResponseHeader> {
    this.checkJsonTrail(jsonPath, header);
    const value = {
      name,
      ...header,
    };
    return {
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.ResponseHeader,
        conceptualLocation: location,
      },
      value,
    };
  }

  *traverseLinks() {}

  *traverseBody(
    body: OpenAPIV3.MediaTypeObject,
    contentType: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: BodyLocation
  ): IterableIterator<IFact> {
    this.checkJsonTrail(jsonPath, body);
    const { schema, examples, example } = body;

    if (schema) {
      if (isNotReferenceObject(schema)) {
        yield this.onContentForBody(
          schema,
          contentType,
          jsonPath,
          conceptualPath,
          location
        );
        yield* this.traverseSchema(
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

    if (examples) {
      for (let [name, example] of Object.entries(examples)) {
        if (isNotReferenceObject(example)) {
          yield this.onBodyExample(
            example,
            contentType,
            jsonPointer.append(jsonPath, 'examples', name),
            [...conceptualPath, 'examples', name],
            { ...location, name },
            name
          );
        } else {
          console.warn(
            `Expected a flattened spec, found a reference at: ${conceptualPath.join(
              ' > '
            )}`
          );
        }
      }
    }

    if (example) {
      if (isNotReferenceObject(example)) {
        yield this.onBodyExample(
          { value: example },
          contentType,
          jsonPointer.append(jsonPath, 'example'),
          [...conceptualPath, 'example'],
          { ...location, singular: true }
        );
      } else {
        console.warn(
          `Expected a flattened spec, found a reference at: ${conceptualPath.join(
            ' > '
          )}`
        );
      }
    }
  }

  *traverseField(
    key: string,
    schema: OpenAPIV3.SchemaObject,
    required: boolean,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: FieldLocation
  ): IterableIterator<IFact> {
    this.checkJsonTrail(jsonPath, schema);
    yield this.onField(
      key,
      schema,
      required,
      jsonPath,
      conceptualPath,
      location
    );
    yield* this.traverseSchema(schema, jsonPath, conceptualPath, location);
  }

  // TODO discriminate between ArraySchemaObject | NonArraySchemaObject
  *traverseSchema(
    schema: OpenAPIV3.SchemaObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: FieldLocation
  ): IterableIterator<IFact> {
    this.checkJsonTrail(jsonPath, schema);
    if (schema.oneOf || schema.anyOf || schema.allOf) {
      const schemas = [
        { branchType: 'oneOf', schemas: schema.oneOf },
        { branchType: 'anyOf', schemas: schema.anyOf },
        { branchType: 'allOf', schemas: schema.allOf },
      ].flatMap(({ branchType, schemas }) => {
        if (!schemas) schemas = [];

        return schemas.map((schema, branchIndex) => ({
          branchType,
          branchIndex,
          branchSchema: schema,
        }));
      });
      for (let { branchType, branchIndex, branchSchema } of schemas) {
        const newConceptualPath = [
          ...conceptualPath,
          branchType,
          '' + branchIndex,
        ];

        if (isNotReferenceObject(branchSchema)) {
          yield* this.traverseSchema(
            branchSchema,
            jsonPointer.append(jsonPath, branchType, '' + branchIndex),
            newConceptualPath,
            location
          );
        } else {
          console.warn(
            `Expected a flattened spec, found a reference at: ${newConceptualPath.join(
              ' > '
            )}`
          );
        }
      }
    }
    switch (schema.type) {
      case 'object':
        for (let [key, fieldSchema] of Object.entries(
          schema.properties || {}
        )) {
          if (isNotReferenceObject(fieldSchema)) {
            yield* this.traverseField(
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
        break;
      case 'array':
        const arrayItems = schema.items;
        if (isNotReferenceObject(arrayItems)) {
          yield* this.traverseSchema(
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

  *traverseComponentSchema(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    schemaName: string
  ): IterableIterator<IFact> {
    const jsonPath = jsonPointer.append(
      '',
      'components',
      'schemas',
      schemaName
    );
    const conceptualPath = jsonPointer.decode(jsonPath);
    const conceptualLocation = { inComponentSchema: { schemaName } };

    if (isNotReferenceObject(schema)) {
      this.checkJsonTrail(jsonPath, schema);

      if (schema.example) {
        yield this.onComponentSchemaExample(
          schema.example,
          jsonPointer.append(jsonPath, 'example'),
          [...conceptualPath, 'example'],
          conceptualLocation
        );
      }
    } else {
      console.warn(
        `Expected a flattened spec, found a reference at: ${conceptualPath.join(
          ' > '
        )}`
      );
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////

  getSchemaWithoutNestedThings(
    schema: OpenAPIV3.SchemaObject
  ): Omit<OpenAPIV3.SchemaObject, 'item' | 'required' | 'properties'> {
    if (schema.type === 'array') {
      const { items, required, properties, ...schemaWithoutNestedThings } =
        schema;
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
  ): FactVariant<OpenApiKind.Body> {
    const flatSchema = this.getSchemaWithoutNestedThings(schema);
    const value = {
      contentType,
      flatSchema,
    };
    return {
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.Body,
        conceptualLocation: location,
      },
      value,
    };
  }

  onBodyExample(
    example: OpenAPIV3.ExampleObject,
    contentType: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    conceptualLocation: BodyExampleLocation,
    name?: string
  ): FactVariant<OpenApiKind.BodyExample> {
    return {
      value: {
        contentType,
        name,
        ...example,
      },
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.BodyExample,
        conceptualLocation,
      },
    };
  }

  onField(
    key: string,
    schema: OpenAPIV3.SchemaObject,
    required: boolean,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: FieldLocation
  ): FactVariant<OpenApiKind.Field> {
    this.checkJsonTrail(jsonPath, schema);
    const flatSchema = this.getSchemaWithoutNestedThings(schema);

    const value: OpenApiFieldFact = {
      key,
      flatSchema,
      required,
    };
    return {
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.Field,
        conceptualLocation: location,
      },
      value,
    };
  }

  getOperationWithoutNestedThings(
    operation: OpenAPIV3.OperationObject
  ): Omit<
    OpenAPIV3.OperationObject,
    'parameters' | 'responses' | 'requestBody'
  > {
    const {
      parameters,
      requestBody,
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
  ): FactVariant<OpenApiKind.Operation> {
    this.checkJsonTrail(jsonPath, operation);
    const flatOperation = this.getOperationWithoutNestedThings(operation);
    const value: OpenApiOperationFact = {
      ...flatOperation,
      method,
      pathPattern,
    };
    return {
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.Operation,
        conceptualLocation: location,
      },
      value,
    };
  }
  onRequest(
    request: OpenAPIV3.RequestBodyObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: RequestLocation
  ): FactVariant<OpenApiKind.Request> {
    this.checkJsonTrail(jsonPath, request);
    const flatRequest = this.getRequestWithoutNestedThings(request);
    const value = {
      ...flatRequest,
    };
    return {
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.Request,
        conceptualLocation: location,
      },
      value,
    };
  }
  getRequestWithoutNestedThings(
    request: OpenAPIV3.RequestBodyObject
  ): Omit<OpenAPIV3.RequestBodyObject, 'content'> {
    const { content, ...requestWithoutNestedThings } = request;
    return requestWithoutNestedThings;
  }

  onResponse(
    response: OpenAPIV3.ResponseObject,
    statusCode: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ResponseLocation
  ): FactVariant<OpenApiKind.Response> {
    this.checkJsonTrail(jsonPath, response);
    const flatResponse = this.getResponseWithoutNestedThings(response);
    const value = {
      ...flatResponse,
      statusCode,
    };
    return {
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.Response,
        conceptualLocation: location,
      },
      value,
    };
  }
  getResponseWithoutNestedThings(
    response: OpenAPIV3.ResponseObject
  ): Omit<OpenAPIV3.ResponseObject, 'headers' | 'content'> {
    const { headers, content, ...responseWithoutNestedThings } = response;
    return responseWithoutNestedThings;
  }

  onComponentSchemaExample(
    example: any,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    conceptualLocation: ComponentSchemaLocation
  ): FactVariant<OpenApiKind.ComponentSchemaExample> {
    return {
      value: example,
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.ComponentSchemaExample,
        conceptualLocation,
      },
    };
  }

  // helper

  checkJsonTrail<G>(jsonPath: string, mustShareIdentity: G) {
    invariant(
      jsonPointer.get(this.input!, jsonPath.toString()) === mustShareIdentity,
      `json trail is not being set properly at ${jsonPath}`
    );
  }
}
