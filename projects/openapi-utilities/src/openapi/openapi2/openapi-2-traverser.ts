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
  OpenApiSpecificationFact,
  FactVariant,
  OpenApi3SchemaFact,
  OpenApiRequestFact,
} from '../sdk/types';
import { IPathComponent } from '../sdk/types';
import invariant from 'ts-invariant';
import { jsonPointerHelpers as jsonPointer } from '@useoptic/json-pointer-helpers';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import {
  normalizeOpenApiPath,
  isObject,
  getReadableLocation,
  isNotReferenceObject,
} from '../../utilities/traverse-helpers';

export class OpenAPI2Traverser implements Traverse<OpenAPIV2.Document> {
  format = 'openapi2';

  input: OpenAPIV2.Document | undefined = undefined;

  traverse(input: OpenAPIV2.Document): void {
    this.input = input;
  }

  // see https://github.com/OAI/OpenAPI-Specification/issues/1259
  getConsumesContentTypes(operation: OpenAPIV2.OperationObject): string[] {
    return operation.consumes || this.input?.consumes || [];
  }
  getProducesContentTypes(operation: OpenAPIV2.OperationObject): string[] {
    return operation.produces || this.input?.produces || [];
  }

  *facts(): IterableIterator<IFact> {
    if (!this.input) return;

    yield* this.onSpecification(this.input);

    for (let [pathPattern, paths] of Object.entries(this.input.paths || {})) {
      const traverser = this;

      const traverseIfPresent = function* (
        method: OpenAPIV2.HttpMethods
      ): IterableIterator<IFact> {
        const pathObject = paths?.[method];
        if (pathObject) {
          yield* traverser.traverseOperations(pathObject, method, pathPattern, {
            method: method,
            path: pathPattern,
          });
        }
      };

      yield* traverseIfPresent(OpenAPIV2.HttpMethods.GET);
      yield* traverseIfPresent(OpenAPIV2.HttpMethods.PATCH);
      yield* traverseIfPresent(OpenAPIV2.HttpMethods.POST);
      yield* traverseIfPresent(OpenAPIV2.HttpMethods.PUT);
      yield* traverseIfPresent(OpenAPIV2.HttpMethods.DELETE);
      yield* traverseIfPresent(OpenAPIV2.HttpMethods.HEAD);
      yield* traverseIfPresent(OpenAPIV2.HttpMethods.OPTIONS);
    }

    if (this.input.definitions) {
      for (let [name, schema] of Object.entries(this.input.definitions)) {
        yield* this.traverseComponentSchema(schema, name);
      }
    }
  }

  *traverseOperations(
    operation: OpenAPIV2.OperationObject,
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

    const requestBody = operation.parameters?.find((i) => {
      if (isNotReferenceObject(i) && i.in === 'body') return true;
    }) as OpenAPIV2.InBodyParameterObject | undefined;

    const requestBodyIndex: number | undefined =
      operation.parameters?.findIndex((i) => {
        if (isNotReferenceObject(i) && i.in === 'body') return true;
      });

    if (requestBody && requestBodyIndex) {
      if (isNotReferenceObject(requestBody)) {
        for (let contentType of this.getConsumesContentTypes(operation) || [])
          yield* this.traverseBody(
            requestBody,
            contentType,
            jsonPointer.append(
              jsonPath,
              'parameters',
              requestBodyIndex.toString()
            ),
            [...conceptualPath, contentType],
            { ...location, inRequest: { body: { contentType } } }
          );
        yield this.onRequest(
          requestBody,
          jsonPointer.append(
            jsonPath,
            'parameters',
            requestBodyIndex.toString()
          ),
          [...conceptualPath, 'requestBody'],
          { ...location, inRequest: {} }
        );
      } else {
        console.warn(
          `Expected a flattened spec, found a reference at: ${getReadableLocation(
            jsonPointer.append(jsonPath, 'requestBody')
          )}`
        );
      }
    }

    for (let [statusCode, response] of Object.entries(
      (operation.responses || {}) as { [key: string]: OpenAPIV2.ResponseObject }
    )) {
      const nextJsonPath = jsonPointer.append(
        jsonPath,
        'responses',
        statusCode
      );
      if (!isObject(response)) {
        console.warn(
          `Expected an object at: ${getReadableLocation(
            nextJsonPath
          )}, found ${response}`
        );
      } else if (isNotReferenceObject(response)) {
        yield* this.traverseResponse(
          response,
          operation,
          statusCode,
          nextJsonPath,
          [...conceptualPath, 'responses', statusCode],
          { ...location, inResponse: { statusCode } }
        );
      } else {
        console.warn(
          `Expected a flattened spec, found a reference at: ${getReadableLocation(
            nextJsonPath
          )}`
        );
      }
    }
  }

  *traverseResponse(
    response: OpenAPIV2.ResponseObject,
    operation: OpenAPIV2.OperationObject,
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

    const contentTypes = this.getProducesContentTypes(operation);

    for (let contentType of contentTypes) {
      yield* this.traverseBody(
        response,
        contentType,
        jsonPointer.append(jsonPath),
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
    operation: OpenAPIV2.OperationObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: OperationLocation
  ): IterableIterator<IFact> {
    const locationForParameter = (parameter: OpenAPIV2.ParameterObject) => {
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
        // @limitation support for formData
        return;
      }

      return paramLocation;
    };

    if (operation.parameters) {
      this.checkJsonTrail(jsonPath, operation.parameters);
      for (let [i, parameter] of Object.entries(operation.parameters)) {
        const nextJsonPath = jsonPointer.append(jsonPath, i);
        if (!isObject(parameter)) {
          console.warn(
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
          console.warn(
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
      const shared = sharedParameters.value as OpenAPIV2.ParameterObject[];
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
    parameter: OpenAPIV2.ParameterObject,
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
    response: OpenAPIV2.ResponseObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: ResponseLocation
  ): IterableIterator<IFact> {
    if (response.headers) {
      for (let [name, header] of Object.entries(response.headers)) {
        const nextJsonPath = jsonPointer.append(jsonPath, 'headers', name);
        if (!isObject(header)) {
          console.warn(
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
          console.warn(
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
    header: OpenAPIV2.HeaderObject,
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
    body: { schema?: OpenAPIV2.SchemaObject },
    contentType: string,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: BodyLocation
  ): IterableIterator<IFact> {
    this.checkJsonTrail(jsonPath, body);

    const { schema } = body;

    if (schema) {
      const nextJsonPath = jsonPointer.append(jsonPath, 'schema');
      if (!isObject(schema)) {
        console.warn(
          `Expected an object at: ${getReadableLocation(
            nextJsonPath
          )}, found ${schema}`
        );
      } else if (isNotReferenceObject(schema)) {
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
        console.warn(
          `Expected a flattened spec, found a reference at: ${getReadableLocation(
            nextJsonPath
          )}`
        );
      }
    }

    // @ limitation no example support
    // if (examples) {
    //   for (let [name, example] of Object.entries(examples)) {
    //     const nextJsonPath = jsonPointer.append(jsonPath, 'examples', name);
    //     if (!isObject(example)) {
    //       console.warn(
    //         `Expected an object at: ${getReadableLocation(
    //           nextJsonPath
    //         )}, found ${example}`
    //       );
    //     } else if (isNotReferenceObject(example)) {
    //       yield this.onBodyExample(
    //         example,
    //         contentType,
    //         nextJsonPath,
    //         [...conceptualPath, 'examples', name],
    //         { ...location, name },
    //         name
    //       );
    //     } else {
    //       console.warn(
    //         `Expected a flattened spec, found a reference at: ${getReadableLocation(
    //           nextJsonPath
    //         )}`
    //       );
    //     }
    //   }
    // }
    //
    // if (example) {
    //   yield this.onBodyExample(
    //     { value: example },
    //     contentType,
    //     jsonPointer.append(jsonPath, 'example'),
    //     [...conceptualPath, 'example'],
    //     { ...location, singular: true }
    //   );
    // }
  }

  *traverseField(
    key: string,
    schema: OpenAPIV2.SchemaObject,
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
    schema: OpenAPIV2.SchemaObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: FieldLocation
  ): IterableIterator<IFact> {
    this.checkJsonTrail(jsonPath, schema);
    // note: OAS 2 does not support oneOf | anyOf | allOf
    switch (schema.type) {
      case 'object':
        for (let [key, fieldSchema] of Object.entries(
          schema.properties || {}
        )) {
          const nextJsonPath = jsonPointer.append(jsonPath, 'properties', key);
          if (!isObject(fieldSchema)) {
            console.warn(
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
            console.warn(
              `Expected a flattened spec, found a reference at: ${getReadableLocation(
                nextJsonPath
              )}`
            );
          }
        }
        break;
      case 'array':
        const arrayItems = schema.items;
        const nextJsonPath = jsonPointer.append(jsonPath, 'items');
        if (!isObject(arrayItems)) {
          console.warn(
            `Expected an object at: ${getReadableLocation(
              nextJsonPath
            )}, found ${arrayItems}`
          );
        } else if (arrayItems && isNotReferenceObject(arrayItems)) {
          yield* this.traverseSchema(
            arrayItems,
            nextJsonPath,
            [...conceptualPath, 'items'],
            {
              ...location,
              jsonSchemaTrail: [...(location.jsonSchemaTrail || []), 'items'],
            }
          );
        } else {
          console.warn(
            `Expected a flattened spec, found a reference at: ${getReadableLocation(
              nextJsonPath
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
    schema: OpenAPIV2.SchemaObject,
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
      console.warn(
        `Expected an object at: ${getReadableLocation(
          nextJsonPath
        )}, found ${schema}`
      );
    } else if (isNotReferenceObject(schema)) {
      // @ limitation not supporting examples
      // this.checkJsonTrail(jsonPath, schema);
      // if (schema.example) {
      //   yield this.onComponentSchemaExample(
      //     schema.example,
      //     nextJsonPath,
      //     [...conceptualPath, 'example'],
      //     conceptualLocation
      //   );
      // }
    } else {
      console.warn(
        `Expected a flattened spec, found a reference at: ${getReadableLocation(
          nextJsonPath
        )}`
      );
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////

  *onSpecification(
    specification: OpenAPIV2.Document
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
    specification: OpenAPIV2.Document
  ): OpenApiSpecificationFact {
    const { paths, schemes, definitions, securityDefinitions, security, ...specificationFact } = specification;
    return { ...specificationFact, openapi: this.input?.swagger || '2.0' };
  }

  getSchemaFact(schema: OpenAPIV2.SchemaObject): OpenApi3SchemaFact {
    const {
      items,
      properties,
      required,
      type,
      definitions,
      discriminator,
      ...schemaContents
    } = schema;

    // @ts-ignore
    const schemaFact: OpenApi3SchemaFact = {
      ...schemaContents,
      type: schema.type as OpenApi3SchemaFact['type'],
    };

    return schemaFact;
  }

  onContentForBody(
    schema: OpenAPIV2.SchemaObject,
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

  onBodyExample(
    example: OpenAPIV2.ExampleObject,
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
    schema: OpenAPIV2.SchemaObject,
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
    operation: OpenAPIV2.OperationObject
  ): Omit<
    OpenAPIV3.OperationObject,
    'parameters' | 'responses' | 'requestBody'
  > {
    const { parameters, responses, ...operationFact } = operation;
    return operationFact;
  }

  onOperation(
    operation: OpenAPIV2.OperationObject,
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
    request: OpenAPIV2.InBodyParameterObject,
    jsonPath: string,
    conceptualPath: IPathComponent[],
    location: RequestLocation
  ): FactVariant<OpenApiKind.Request> {
    this.checkJsonTrail(jsonPath, request);
    const flatRequest = this.getRequestFact(request);

    const value: OpenApiRequestFact = {
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
    request: OpenAPIV2.InBodyParameterObject
  ): Omit<OpenAPIV3.RequestBodyObject, 'content'> {
    const { content, ...requestFact } = request;

    const fact: OpenApiRequestFact = {
      description: requestFact.description,
      required: requestFact.required,
    };

    return fact;
  }

  onResponse(
    response: OpenAPIV2.ResponseObject,
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
    response: OpenAPIV2.ResponseObject
  ): Omit<OpenAPIV3.ResponseObject, 'headers' | 'content'> {
    const { headers, schema, ...responseFact } = response;
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
