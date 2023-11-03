import { jsonPointerHelpers as jsonPointer } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import {
  FactLocation,
  FactRawItem,
  OpenApiV3TraverserFact,
  V3FactType,
} from './types';

export const OAS3 = {
  isObjectType(
    type: OpenAPIV3.SchemaObject['type'] | OpenAPIV3_1.SchemaObject['type']
  ): boolean {
    return (
      type === 'object' || (Array.isArray(type) && type.includes('object'))
    );
  },
  isArrayType(
    type: OpenAPIV3.SchemaObject['type'] | OpenAPIV3_1.SchemaObject['type']
  ): boolean {
    return type === 'array' || (Array.isArray(type) && type.includes('array'));
  },
};

// This is the V2 traverser version which is intended to be used for more efficient storage + better compatibility between OpenAPI versions
type Traverse<DocSchema> = {
  format: string;
  traverse(input: DocSchema): void;
  facts(): IterableIterator<OpenApiV3TraverserFact<V3FactType>>;
};

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

export function getRaw<T extends V3FactType>(
  spec: OpenAPIV3.Document,
  fact: OpenApiV3TraverserFact<T>
): FactRawItem<T> {
  return jsonPointer.get(spec, fact.location.jsonPath);
}

export function getLocation<T extends V3FactType>(
  fact: OpenApiV3TraverserFact<T>
): FactLocation<T> {
  const parts = jsonPointer.decode(fact.location.jsonPath);
  if (fact.type === 'specification') {
    return {} as FactLocation<T>;
  } else if (fact.type === 'path') {
    const [, pathPattern] = parts;
    return {
      pathPattern,
    } as FactLocation<T>;
  } else if (
    fact.type === 'operation' ||
    fact.type === 'request-header' ||
    fact.type === 'request-query' ||
    fact.type === 'request-cookie' ||
    fact.type === 'request-path' ||
    fact.type === 'requestBody'
  ) {
    const [, pathPattern, method] = parts;
    return {
      pathPattern,
      method,
    } as FactLocation<T>;
  } else if (fact.type === 'body') {
    // 'paths', {pathPattern}, {method}, 'requestBody', 'content', {contentType}
    // OR
    // 'paths', {pathPattern}, {method}, 'responses', {statusCode}, content', {contentType}
    const isResponse = parts[3] === 'responses';
    if (isResponse) {
      const [, pathPattern, method, , statusCode, , contentType] = parts;
      return {
        location: 'response',
        pathPattern,
        method,
        statusCode,
        contentType,
      } as FactLocation<T>;
    } else {
      const [, pathPattern, method, , , contentType] = parts;
      return {
        location: 'request',
        pathPattern,
        method,
        contentType,
      } as FactLocation<T>;
    }
  } else if (fact.type === 'body-example' || fact.type === 'body-examples') {
    const isResponse = parts[3] === 'responses';
    if (isResponse) {
      const [, pathPattern, method, , statusCode, , contentType, ...trail] =
        parts;
      return {
        location: 'response',
        pathPattern,
        method,
        statusCode,
        contentType,
        trail,
      } as FactLocation<T>;
    } else {
      const [, pathPattern, method, , , contentType, ...trail] = parts;
      return {
        location: 'request',
        pathPattern,
        method,
        contentType,
        trail,
      } as FactLocation<T>;
    }
  } else if (fact.type === 'field') {
    const isResponse = parts[3] === 'responses';
    if (isResponse) {
      const [, pathPattern, method, , statusCode, , contentType, ...trail] =
        parts;
      return {
        location: 'response',
        pathPattern,
        method,
        statusCode,
        contentType,
        trail,
      } as FactLocation<T>;
    } else {
      const [, pathPattern, method, , , contentType, ...trail] = parts;
      return {
        location: 'request',
        pathPattern,
        method,
        contentType,
        trail,
      } as FactLocation<T>;
    }
  } else if (fact.type === 'response') {
    const [, pathPattern, method, , statusCode] = parts;
    return {
      pathPattern,
      method,
      statusCode,
    } as FactLocation<T>;
  } else if (fact.type === 'response-header') {
    const [, pathPattern, method, , statusCode, , name] = parts;
    return {
      pathPattern,
      method,
      statusCode,
      headerName: name,
    } as FactLocation<T>;
  }
  return {} as FactLocation<T>;
}

export class OpenApiV3Traverser implements Traverse<OpenAPIV3.Document> {
  format = 'openapi3';

  input: (OpenAPIV3.Document | OpenAPIV3_1.Document) | undefined = undefined;

  warnings: string[] = [];

  traverse(input: OpenAPIV3.Document | OpenAPIV3_1.Document): void {
    this.input = input;
  }

  *facts(): IterableIterator<OpenApiV3TraverserFact<V3FactType>> {
    if (!this.input || (this.input as any)['x-optic-ci-empty-spec'] === true)
      return;

    yield {
      location: {
        jsonPath: '',
      },
      type: 'specification',
    };

    for (let [pathPattern, paths] of Object.entries(this.input.paths || {})) {
      const traverser = this;
      yield {
        location: {
          jsonPath: jsonPointer.append('', 'paths', pathPattern),
        },
        type: 'path',
      };

      const traverseIfPresent = function* (
        method: OpenAPIV3.HttpMethods
      ): IterableIterator<OpenApiV3TraverserFact<V3FactType>> {
        const pathObject = paths?.[method];
        if (pathObject) {
          yield* traverser.traverseOperations(pathObject, method, pathPattern);
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
    pathPattern: string
  ): IterableIterator<OpenApiV3TraverserFact<V3FactType>> {
    const jsonPath = jsonPointer.append('', 'paths', pathPattern, method);
    yield {
      location: {
        jsonPath: jsonPath,
      },
      type: 'operation',
    };

    yield* this.traverseParameters(
      operation,
      jsonPointer.append(jsonPath, 'parameters'),
      pathPattern
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
            jsonPointer.append(jsonPath, 'requestBody', 'content', contentType)
          );
        yield {
          location: {
            jsonPath: jsonPointer.append(jsonPath, 'requestBody'),
          },
          type: 'requestBody',
        };
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
        yield* this.traverseResponse(response, nextJsonPath);
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
    jsonPath: string
  ): IterableIterator<OpenApiV3TraverserFact<V3FactType>> {
    yield* this.traverseResponseHeaders(response, jsonPath);
    for (let [contentType, body] of Object.entries(response.content || {})) {
      yield* this.traverseBody(
        body,
        contentType,
        jsonPointer.append(jsonPath, 'content', contentType)
      );
    }

    yield {
      location: {
        jsonPath,
      },
      type: 'response',
    };
  }

  *traverseParameters(
    operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject,
    jsonPath: string,
    operationPath: string
  ): IterableIterator<OpenApiV3TraverserFact<V3FactType>> {
    if (operation.parameters) {
      for (let [i, parameter] of Object.entries(operation.parameters)) {
        const nextJsonPath = jsonPointer.append(jsonPath, i);
        if (!isObject(parameter)) {
          this.warnings.push(
            `Expected an object at: ${getReadableLocation(
              nextJsonPath
            )}, found ${parameter}`
          );
        } else if (isNotReferenceObject(parameter)) {
          switch (parameter.in) {
            case 'query':
            case 'header':
            case 'path':
            case 'cookie':
              yield {
                location: {
                  jsonPath: nextJsonPath,
                },
                type: `request-${parameter.in}`,
              };
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
      operationPath,
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
        const nextJsonPath = jsonPointer.append(
          sharedParametersPointer,
          i.toString()
        );
        switch (parameter.in) {
          case 'query':
          case 'header':
          case 'path':
          case 'cookie':
            yield {
              location: {
                jsonPath: nextJsonPath,
              },
              type: `request-${parameter.in}`,
            };
        }
      }
    }
  }

  *traverseResponseHeaders(
    response: OpenAPIV3.ResponseObject | OpenAPIV3_1.ResponsesObject,
    jsonPath: string
  ): IterableIterator<OpenApiV3TraverserFact<V3FactType>> {
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
          yield {
            location: { jsonPath: nextJsonPath },
            type: 'response-header',
          };
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

  *traverseBody(
    body: OpenAPIV3.MediaTypeObject | OpenAPIV3_1.MediaTypeObject,
    contentType: string,
    jsonPath: string
  ): IterableIterator<OpenApiV3TraverserFact<V3FactType>> {
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
        yield {
          location: {
            jsonPath: jsonPath,
          },
          type: 'body',
        };

        yield* this.traverseSchema(schema, nextJsonPath);
      } else {
        this.warnings.push(
          `Expected a flattened spec, found a reference at: ${getReadableLocation(
            nextJsonPath
          )}`
        );
      }
    }

    if (examples) {
      yield {
        location: {
          jsonPath: jsonPointer.append(jsonPath, 'examples'),
        },
        type: 'body-examples',
      };
      for (let [name, example] of Object.entries(examples)) {
        const nextJsonPath = jsonPointer.append(jsonPath, 'examples', name);
        if (!isObject(example)) {
          this.warnings.push(
            `Expected an object at: ${getReadableLocation(
              nextJsonPath
            )}, found ${example}`
          );
        } else if (isNotReferenceObject(example)) {
          yield {
            location: {
              jsonPath: nextJsonPath,
            },
            type: 'body-example',
          };
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
      yield {
        location: {
          jsonPath: jsonPointer.append(jsonPath, 'example'),
        },
        type: 'body-example',
      };
    }
  }

  *traverseField(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject,
    jsonPath: string
  ): IterableIterator<OpenApiV3TraverserFact<V3FactType>> {
    yield {
      location: {
        jsonPath,
      },
      type: 'field',
    };
    yield* this.traverseSchema(schema, jsonPath);
  }

  *traverseSchema(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject,
    jsonPath: string
  ): IterableIterator<OpenApiV3TraverserFact<V3FactType>> {
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

        if (!isObject(branchSchema)) {
          this.warnings.push(
            `Expected an object at: ${getReadableLocation(
              newJsonPath
            )}, found ${branchSchema}`
          );
        } else if (isNotReferenceObject(branchSchema)) {
          yield* this.traverseSchema(branchSchema, newJsonPath);
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
          yield* this.traverseField(fieldSchema, nextJsonPath);
        } else {
          this.warnings.push(
            `Expected a flattened spec, found a reference at: ${getReadableLocation(
              nextJsonPath
            )}`
          );
        }
      }
    } else if (OAS3.isArrayType(schema.type)) {
      const arrayItems = (schema as OpenAPIV3.ArraySchemaObject).items;
      const nextJsonPath = jsonPointer.append(jsonPath, 'items');
      if (!isObject(arrayItems)) {
        this.warnings.push(
          `Expected an object at: ${getReadableLocation(
            nextJsonPath
          )}, found ${arrayItems}`
        );
      } else if (isNotReferenceObject(arrayItems)) {
        yield* this.traverseSchema(arrayItems, nextJsonPath);
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
  ): IterableIterator<OpenApiV3TraverserFact<V3FactType>> {
    const jsonPath = jsonPointer.append(
      '',
      'components',
      'schemas',
      schemaName
    );
    const nextJsonPath = jsonPointer.append(jsonPath, 'example');

    if (!isObject(schema)) {
      this.warnings.push(
        `Expected an object at: ${getReadableLocation(
          nextJsonPath
        )}, found ${schema}`
      );
    } else if (isNotReferenceObject(schema)) {
      if (schema.example) {
        yield {
          location: {
            jsonPath: nextJsonPath,
          },
          type: 'component-schema-example',
        };
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
