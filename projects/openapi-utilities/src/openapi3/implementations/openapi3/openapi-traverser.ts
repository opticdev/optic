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
  CookieParameterLocation,
  BodyLocation,
  BodyExampleLocation,
  QueryParameterLocation,
  FieldLocation,
  ComponentSchemaLocation,
  IFact,
  OpenApiSpecificationFact,
  FactVariant,
  OpenApi3SchemaFact,
} from '../../sdk/types';
import { IPathComponent } from '../../sdk/types';
import invariant from 'ts-invariant';
import { jsonPointerHelpers as jsonPointer } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import { OAS3 } from '../../traverser';
import { SchemaLocation } from '../../sdk/types/location';

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

const getReadableLocation = (jsonPath: string): string =>
  jsonPointer.decode(jsonPath).join(' > ');

const isNotReferenceObject = <T extends {}>(
  maybeReference: T | OpenAPIV3.ReferenceObject
): maybeReference is Exclude<T, OpenAPIV3.ReferenceObject> => {
  return !('$ref' in maybeReference);
};

const isObject = (value: any) => {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
};

// TODO deprecate this usage of facts
// This is currently used by the rule runner
export class OpenAPITraverser implements Traverse<OpenAPIV3.Document> {
  format = 'openapi3';

  input: (OpenAPIV3.Document | OpenAPIV3_1.Document) | undefined = undefined;
  warnings: string[] = [];

  traverse(input: OpenAPIV3.Document | OpenAPIV3_1.Document): void {
    this.input = input;
  }

  *facts(): IterableIterator<IFact> {
    if (!this.input) return;

    yield* this.onSpecification(this.input);

    for (let [pathPattern, paths] of Object.entries(this.input.paths || {})) {
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
    operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject,
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
      if (!isObject(requestBody)) {
        this.warnings.push(
          `Expected an object at: ${getReadableLocation(
            jsonPointer.append(jsonPath, 'requestBody')
          )}, found ${requestBody}`
        );
      } else if (isNotReferenceObject(requestBody)) {
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
        this.warnings.push(
          `Expected a flattened spec, found a reference at: ${getReadableLocation(
            jsonPointer.append(jsonPath, 'requestBody')
          )}`
        );
      }
    }

    for (let [statusCode, response] of Object.entries(
      operation.responses || {}
    )) {
      const nextJsonPath = jsonPointer.append(
        jsonPath,
        'responses',
        statusCode
      );
      if (!isObject(response)) {
        this.warnings.push(
          `Expected an object at: ${getReadableLocation(
            nextJsonPath
          )}, found ${response}`
        );
      } else if (isNotReferenceObject(response)) {
        yield* this.traverseResponse(
          response,
          statusCode,
          nextJsonPath,
          [...conceptualPath, 'responses', statusCode],
          { ...location, inResponse: { statusCode } }
        );
      } else {
        this.warnings.push(
          `Expected a flattened spec, found a reference at: ${getReadableLocation(
            nextJsonPath
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
    operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: OperationLocation
  ): IterableIterator<IFact> {
    const locationForParameter = (
      parameter: OpenAPIV3.ParameterObject | OpenAPIV3_1.ParameterObject
    ) => {
      let paramLocation:
        | PathParameterLocation
        | QueryParameterLocation
        | HeaderParameterLocation
        | CookieParameterLocation;

      if (parameter.in === 'query') {
        paramLocation = { ...location, inRequest: { query: parameter.name } };
      } else if (parameter.in === 'header') {
        paramLocation = {
          ...location,
          inRequest: { header: parameter.name },
        };
      } else if (parameter.in === 'path') {
        paramLocation = { ...location, inRequest: { path: parameter.name } };
      } else if (parameter.in === 'cookie') {
        paramLocation = { ...location, inRequest: { cookie: parameter.name } };
      } else {
        this.warnings.push('Found a parameter that was not handled');
        return;
      }

      return paramLocation;
    };

    if (operation.parameters) {
      this.checkJsonTrail(jsonPath, operation.parameters);
      for (let [i, parameter] of Object.entries(operation.parameters)) {
        const nextJsonPath = jsonPointer.append(jsonPath, i);
        if (!isObject(parameter)) {
          this.warnings.push(
            `Expected an object at: ${getReadableLocation(
              nextJsonPath
            )}, found ${parameter}`
          );
        } else if (isNotReferenceObject(parameter)) {
          const location = locationForParameter(parameter);
          if (location) {
            let fact = this.onRequestParameter(
              parameter,
              nextJsonPath,
              [...conceptualPath, parameter.in, parameter.name],
              location
            );
            if (fact) yield fact;
          }
        } else {
          this.warnings.push(
            `Expected a flattened spec, found a reference at: ${getReadableLocation(
              nextJsonPath
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
      const shared = sharedParameters.value as
        | OpenAPIV3.ParameterObject[]
        | OpenAPIV3_1.ParameterObject[];
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
    parameter: OpenAPIV3.ParameterObject | OpenAPIV3_1.ParameterObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location:
      | PathParameterLocation
      | QueryParameterLocation
      | HeaderParameterLocation
      | CookieParameterLocation
  ):
    | undefined
    | FactVariant<OpenApiKind.HeaderParameter>
    | FactVariant<OpenApiKind.PathParameter>
    | FactVariant<OpenApiKind.QueryParameter>
    | FactVariant<OpenApiKind.CookieParameter> {
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
      case 'cookie':
        return {
          location: {
            jsonPath,
            conceptualPath,
            kind: OpenApiKind.CookieParameter,
            conceptualLocation: location as CookieParameterLocation,
          },
          value,
        };
    }
  }

  *traverseResponseHeaders(
    response: OpenAPIV3.ResponseObject | OpenAPIV3_1.ResponsesObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ResponseLocation
  ): IterableIterator<IFact> {
    if (response.headers) {
      for (let [name, header] of Object.entries(response.headers)) {
        const nextJsonPath = jsonPointer.append(jsonPath, 'headers', name);
        if (!isObject(header)) {
          this.warnings.push(
            `Expected an object at: ${getReadableLocation(
              nextJsonPath
            )}, found ${header}`
          );
        } else if (isNotReferenceObject(header)) {
          yield this.onResponseHeader(
            name,
            header,
            nextJsonPath,
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
          this.warnings.push(
            `Expected a flattened spec, found a reference at: ${getReadableLocation(
              nextJsonPath
            )}`
          );
        }
      }
    }
  }

  onResponseHeader(
    name: string,
    header: OpenAPIV3.HeaderObject | OpenAPIV3_1.HeaderObject,
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

  *traverseBody(
    body: OpenAPIV3.MediaTypeObject | OpenAPIV3_1.MediaTypeObject,
    contentType: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: BodyLocation
  ): IterableIterator<IFact> {
    this.checkJsonTrail(jsonPath, body);
    const { schema, examples, example } = body;

    if (schema) {
      const nextJsonPath = jsonPointer.append(jsonPath, 'schema');
      if (!isObject(schema)) {
        this.warnings.push(
          `Expected an object at: ${getReadableLocation(
            nextJsonPath
          )}, found ${schema}`
        );
      } else if (isNotReferenceObject(schema)) {
        yield this.onSchema(schema, nextJsonPath, conceptualPath, {
          ...location,
          jsonSchemaTrail: [],
          context: {
            type: 'body',
          },
        });
        yield this.onContentForBody(
          schema,
          contentType,
          jsonPath,
          conceptualPath,
          location
        );
        yield* this.traverseSchema(schema, nextJsonPath, conceptualPath, {
          ...location,
          jsonSchemaTrail: [],
        });
      } else {
        this.warnings.push(
          `Expected a flattened spec, found a reference at: ${getReadableLocation(
            nextJsonPath
          )}`
        );
      }
    }

    if (examples) {
      for (let [name, example] of Object.entries(examples)) {
        const nextJsonPath = jsonPointer.append(jsonPath, 'examples', name);
        if (!isObject(example)) {
          this.warnings.push(
            `Expected an object at: ${getReadableLocation(
              nextJsonPath
            )}, found ${example}`
          );
        } else if (isNotReferenceObject(example)) {
          yield this.onBodyExample(
            example,
            contentType,
            nextJsonPath,
            [...conceptualPath, 'examples', name],
            { ...location, name },
            name
          );
        } else {
          this.warnings.push(
            `Expected a flattened spec, found a reference at: ${getReadableLocation(
              nextJsonPath
            )}`
          );
        }
      }
    }

    if (example) {
      yield this.onBodyExample(
        { value: example },
        contentType,
        jsonPointer.append(jsonPath, 'example'),
        [...conceptualPath, 'example'],
        { ...location, singular: true }
      );
    }
  }

  *traverseField(
    key: string,
    schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject,
    required: boolean,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: FieldLocation
  ): IterableIterator<IFact> {
    this.checkJsonTrail(jsonPath, schema);
    yield this.onSchema(schema, jsonPath, conceptualPath, {
      ...location,
      context: {
        type: 'field',
        key,
        required,
      },
    });
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

  *traverseSchema(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject,
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
        const newJsonPath = jsonPointer.append(
          jsonPath,
          branchType,
          '' + branchIndex
        );
        const newConceptualPath = [
          ...conceptualPath,
          branchType,
          '' + branchIndex,
        ];

        if (!isObject(branchSchema)) {
          this.warnings.push(
            `Expected an object at: ${getReadableLocation(
              newJsonPath
            )}, found ${branchSchema}`
          );
        } else if (isNotReferenceObject(branchSchema)) {
          yield this.onSchema(branchSchema, newJsonPath, newConceptualPath, {
            ...location,
            context: { type: branchType as any },
          });
          yield* this.traverseSchema(
            branchSchema,
            newJsonPath,
            newConceptualPath,
            location
          );
        } else {
          this.warnings.push(
            `Expected a flattened spec, found a reference at: ${getReadableLocation(
              newJsonPath
            )}`
          );
        }
      }
    }
    if (OAS3.isObjectType(schema.type)) {
      for (let [key, fieldSchema] of Object.entries(schema.properties || {})) {
        const nextJsonPath = jsonPointer.append(jsonPath, 'properties', key);
        if (!isObject(fieldSchema)) {
          this.warnings.push(
            `Expected an object at: ${getReadableLocation(
              jsonPath
            )}, nextJsonPath ${fieldSchema}`
          );
        } else if (isNotReferenceObject(fieldSchema)) {
          yield* this.traverseField(
            key,
            fieldSchema,
            (schema.required || []).includes(key),
            nextJsonPath,
            [...conceptualPath, key],
            {
              ...location,
              jsonSchemaTrail: [...(location.jsonSchemaTrail || []), key],
            }
          );
        } else {
          this.warnings.push(
            `Expected a flattened spec, found a reference at: ${getReadableLocation(
              nextJsonPath
            )}`
          );
        }
      }
    }
    if (OAS3.isArrayType(schema.type)) {
      const arrayItems = (schema as OpenAPIV3.ArraySchemaObject).items;
      const nextJsonPath = jsonPointer.append(jsonPath, 'items');
      if (!isObject(arrayItems)) {
        this.warnings.push(
          `Expected an object at: ${getReadableLocation(
            nextJsonPath
          )}, found ${arrayItems}`
        );
      } else if (isNotReferenceObject(arrayItems)) {
        const nextConceptualPath = [...conceptualPath, 'items'];
        const nextLocation = {
          ...location,
          jsonSchemaTrail: [...(location.jsonSchemaTrail || []), 'items'],
        };
        yield this.onSchema(arrayItems, nextJsonPath, nextConceptualPath, {
          ...nextLocation,
          context: { type: 'array' },
        });
        yield* this.traverseSchema(
          arrayItems,
          nextJsonPath,
          nextConceptualPath,
          nextLocation
        );
      } else {
        this.warnings.push(
          `Expected a flattened spec, found a reference at: ${getReadableLocation(
            nextJsonPath
          )}`
        );
      }
    }
  }

  *traverseComponentSchema(
    schema:
      | OpenAPIV3.SchemaObject
      | OpenAPIV3.ReferenceObject
      | OpenAPIV3_1.SchemaObject
      | OpenAPIV3_1.ReferenceObject,
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
    const nextJsonPath = jsonPointer.append(jsonPath, 'example');

    if (!isObject(schema)) {
      this.warnings.push(
        `Expected an object at: ${getReadableLocation(
          nextJsonPath
        )}, found ${schema}`
      );
    } else if (isNotReferenceObject(schema)) {
      this.checkJsonTrail(jsonPath, schema);

      if (schema.example) {
        yield this.onComponentSchemaExample(
          schema.example,
          nextJsonPath,
          [...conceptualPath, 'example'],
          conceptualLocation
        );
      }
    } else {
      this.warnings.push(
        `Expected a flattened spec, found a reference at: ${getReadableLocation(
          nextJsonPath
        )}`
      );
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////

  *onSpecification(
    specification: OpenAPIV3.Document | OpenAPIV3_1.Document
  ): IterableIterator<FactVariant<OpenApiKind.Specification>> {
    yield {
      location: {
        jsonPath: '',
        conceptualPath: [],
        conceptualLocation: {},
        kind: OpenApiKind.Specification,
      },
      value: this.getSpecificationFact(specification),
    };
  }

  getSpecificationFact(
    specification: OpenAPIV3.Document | OpenAPIV3_1.Document
  ): OpenApiSpecificationFact {
    const { paths, components, ...specificationFact } = specification;
    return specificationFact;
  }

  getSchemaFact(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject
  ): OpenApi3SchemaFact {
    const hasNullableSet = 'nullable' in schema && Boolean(schema.nullable);

    const baseSchema = (() => {
      if (schema.type === 'array') {
        const {
          items,
          required,
          properties,
          // @ts-ignore
          nullable,
          ...schemaFact
        } = schema;
        return schemaFact;
      } else {
        const {
          required,
          properties,
          // @ts-ignore
          nullable,
          ...schemaFact
        } = schema;
        return schemaFact;
      }
    })();

    const typeOverride: OpenApi3SchemaFact['type'] = (() => {
      if (hasNullableSet && typeof baseSchema.type === 'string') {
        return [baseSchema.type, 'null'];
      } else if (hasNullableSet && !baseSchema.type) {
        return ['null'];
      }
      return baseSchema.type;
    })();

    if (typeOverride) return { ...baseSchema, type: typeOverride };
    return baseSchema;
  }

  onContentForBody(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject,
    contentType: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: BodyLocation
  ): FactVariant<OpenApiKind.Body> {
    const flatSchema = this.getSchemaFact(schema);
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

  onSchema(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: SchemaLocation
  ): FactVariant<OpenApiKind.Schema> {
    const flatSchema = this.getSchemaFact(schema);

    return {
      value: {
        flatSchema,
      },
      location: {
        jsonPath,
        conceptualPath,
        conceptualLocation: location,
        kind: OpenApiKind.Schema,
      },
    };
  }

  onBodyExample(
    example: OpenAPIV3.ExampleObject | OpenAPIV3_1.ExampleObject,
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
    schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject,
    required: boolean,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: FieldLocation
  ): FactVariant<OpenApiKind.Field> {
    this.checkJsonTrail(jsonPath, schema);
    const flatSchema = this.getSchemaFact(schema);

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

  getOperationFact(
    operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject
  ): Omit<
    OpenAPIV3.OperationObject,
    'parameters' | 'responses' | 'requestBody'
  > {
    const { parameters, requestBody, responses, ...operationFact } = operation;
    return operationFact;
  }

  onOperation(
    operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject,
    pathPattern: string,
    method: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: OperationLocation
  ): FactVariant<OpenApiKind.Operation> {
    this.checkJsonTrail(jsonPath, operation);
    const flatOperation = this.getOperationFact(operation);
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
    request: OpenAPIV3.RequestBodyObject | OpenAPIV3_1.RequestBodyObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: RequestLocation
  ): FactVariant<OpenApiKind.Request> {
    this.checkJsonTrail(jsonPath, request);
    const flatRequest = this.getRequestFact(request);
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
  getRequestFact(
    request: OpenAPIV3.RequestBodyObject | OpenAPIV3_1.RequestBodyObject
  ): Omit<OpenAPIV3.RequestBodyObject, 'content'> {
    const { content, ...requestFact } = request;
    return requestFact;
  }

  onResponse(
    response: OpenAPIV3.ResponseObject | OpenAPIV3_1.ResponseObject,
    statusCode: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ResponseLocation
  ): FactVariant<OpenApiKind.Response> {
    this.checkJsonTrail(jsonPath, response);
    const flatResponse = this.getResponseFact(response);
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
  getResponseFact(
    response: OpenAPIV3.ResponseObject | OpenAPIV3_1.ResponseObject
  ): Omit<OpenAPIV3.ResponseObject, 'headers' | 'content'> {
    const { headers, content, ...responseFact } = response;
    return responseFact;
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
