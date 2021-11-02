import { FactAccumulator, Traverse } from "../../sdk/types";
import { IPathComponent } from "../../sdk/types";
import { OpenAPIV3 } from "openapi-types";

export function normalizeOpenApiPath(path: string): string {
  return path
    .split("/")
    .map((pathComponent) => {
      if (pathComponent.startsWith("{") && pathComponent.endsWith("}")) {
        return "{}";
      }
      return pathComponent;
    })
    .join("/");
}

export class OpenAPITraverser
  implements Traverse<OpenAPIV3.Document, OpenApiFact>
{
  format = "openapi3";
  accumulator = new FactAccumulator<OpenApiFact>([]);

  traverse(input: OpenAPIV3.Document): void {
    Object.entries(input.paths).forEach(([pathPattern, paths]) => {
      if (paths?.get) this.traverseOperations(paths?.get!, "get", pathPattern);
      if (paths?.patch)
        this.traverseOperations(paths?.patch!, "patch", pathPattern);
      if (paths?.post)
        this.traverseOperations(paths?.post!, "post", pathPattern);
      if (paths?.put) this.traverseOperations(paths?.put!, "put", pathPattern);
      if (paths?.delete)
        this.traverseOperations(paths?.delete!, "delete", pathPattern);
    });
  }

  traverseOperations(
    operation: OpenAPIV3.OperationObject,
    method: string,
    pathPattern: string
  ): void {
    const jsonPath = ["paths", pathPattern, method];
    const normalizedPath = normalizeOpenApiPath(pathPattern);
    const conceptualPath = ["operations", normalizedPath, method];
    this.onOperation(operation, pathPattern, method, jsonPath, conceptualPath);

    this.traverseParameters(
      operation,
      [...jsonPath, "parameters"],
      [...conceptualPath, "parameters"]
    );

    if (operation.requestBody) {
      const requestBody = operation.requestBody as OpenAPIV3.RequestBodyObject;
      Object.entries(requestBody.content || {}).forEach(
        ([contentType, body]) => {
          this.traverseBody(
            body,
            contentType,
            [...jsonPath, "content", contentType, "body"],
            [...conceptualPath, contentType],
            LocationMetadata.inRequest
          );
        }
      );
    }

    Object.entries(operation.responses).forEach(([statusCode, response]) => {
      this.traverseResponse(
        response as OpenAPIV3.ResponseObject,
        statusCode,
        [...jsonPath, "responses", statusCode],
        [...conceptualPath, "responses", statusCode]
      );
    });
  }

  traverseResponse(
    response: OpenAPIV3.ResponseObject,
    statusCode: string,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[]
  ): void {
    this.traverseResponseHeaders(response, jsonPath, conceptualPath);

    Object.entries(response.content || {}).forEach(([contentType, body]) => {
      this.traverseBody(
        body,
        contentType,
        [...jsonPath, "content", contentType, "body"],
        [...conceptualPath, contentType],
        LocationMetadata.inResponse
      );
    });

    this.onResponse(response, statusCode, jsonPath, conceptualPath);
  }

  traverseParameters(
    operation: OpenAPIV3.OperationObject,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[]
  ) {
    if (operation.parameters) {
      operation.parameters.forEach((p, i) => {
        const parameter = p as OpenAPIV3.ParameterObject;
        this.onRequestParameter(
          parameter,
          [...jsonPath, i],
          [...conceptualPath, parameter.in, parameter.name]
        );
      });
    }
  }
  onRequestParameter(
    parameter: OpenAPIV3.ParameterObject,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[]
  ) {
    const value: OpenApiRequestParameterFact = {
      //@TODO: aidan decide what we need from here
      ...parameter,
    };
    this.accumulator.log({
      location: {
        jsonPath,
        conceptualPath,
        kind: parameter.in,
        location: LocationMetadata.inRequest,
      },
      value,
    });
  }

  traverseResponseHeaders(
    response: OpenAPIV3.ResponseObject,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[]
  ) {
    if (response.headers) {
      Object.entries(response.headers).forEach(([name, value]) => {
        const header = value as OpenAPIV3.HeaderObject;
        this.onResponseHeader(
          name,
          header,
          [...jsonPath, "headers", name],
          [...conceptualPath, "headers", name]
        );
      });
    }
  }

  onResponseHeader(
    name: string,
    header: OpenAPIV3.HeaderObject,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[]
  ) {
    const value: OpenApiHeaderFact = {
      name,
      ...header,
    };
    this.accumulator.log({
      location: {
        jsonPath,
        conceptualPath,
        kind: OpenApiKind.HeaderParameter,
        location: LocationMetadata.inRequest,
      },
      value,
    });
  }

  traverseLinks() {}

  traverseBody(
    body: OpenAPIV3.MediaTypeObject,
    contentType: string,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[],
    location: LocationMetadata
  ) {
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
        jsonPath,
        conceptualPath,
        location
      );
    }
  }

  traverseField(
    key: string,
    schema: OpenAPIV3.SchemaObject,
    required: boolean,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[],
    location: LocationMetadata
  ) {
    this.onField(key, schema, required, jsonPath, conceptualPath, location);
    this.traverseSchema(schema, jsonPath, conceptualPath, location);
  }

  traverseSchema(
    schema: OpenAPIV3.SchemaObject,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[],
    location: LocationMetadata
  ) {
    if (schema.oneOf || schema.anyOf || schema.allOf) {
      // iterate these, multiple branches at path
    }
    switch (schema.type) {
      case "object":
        // this.onObject(...)
        Object.entries(schema.properties || {}).forEach(([key, fieldSchema]) =>
          this.traverseField(
            key,
            fieldSchema as OpenAPIV3.SchemaObject,
            (schema.required || []).includes(key),
            [...jsonPath, "properties", key],
            [...conceptualPath, key],
            location
          )
        );
        break;
      case "array":
        // this.onArray()
        this.traverseSchema(
          schema.items as OpenAPIV3.SchemaObject,
          [...jsonPath, "items"],
          [...conceptualPath, "items"],
          location
        );
        break;
      case "string":
      case "number":
      case "integer":
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
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[],
    location: LocationMetadata
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
        location,
      },
      value,
    });
  }

  onField(
    key: string,
    schema: OpenAPIV3.SchemaObject,
    required: boolean,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[],
    location: LocationMetadata
  ) {
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
        location,
      },
      value,
    });
  }

  getOperationWithoutNestedThings(
    operation: OpenAPIV3.OperationObject
  ): OpenAPIV3.OperationObject {
    const { parameters, responses, ...operationWithoutNestedThings } =
      operation;
    return operationWithoutNestedThings as OpenAPIV3.OperationObject;
  }

  onOperation(
    operation: OpenAPIV3.OperationObject,
    pathPattern: string,
    method: string,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[]
  ) {
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
        location: LocationMetadata.inRequest,
      },
      value,
    });
  }
  onResponse(
    response: OpenAPIV3.ResponseObject,
    statusCode: string,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[]
  ) {
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
        location: LocationMetadata.inResponse,
      },
      value,
    });
  }
  getResponseWithoutNestedThings(
    response: OpenAPIV3.ResponseObject
  ): OpenAPIV3.ResponseObject {
    const { headers, content, ...responseWithoutNestedThings } = response;
    return responseWithoutNestedThings as OpenAPIV3.ResponseObject;
  }
}

//@TODO: figure out what other info downstream tools will need
export enum LocationMetadata {
  inRequest = "inRequest",
  inResponse = "inResponse",
}
export enum OpenApiKind {
  Operation = "operation",
  Request = "request",
  QueryParameter = "query-parameter",
  HeaderParameter = "header-parameter",
  Response = "response",
  Body = "body",
  Object = "object",
  Field = "field",
  Array = "array",
  Primitive = "primitive",
}

type OpenApiFact =
  | OpenApiOperationFact
  | OpenApiRequestFact
  | OpenApiRequestParameterFact
  | OpenApiResponseFact
  | OpenApiHeaderFact
  | OpenApiBodyFact
  | OpenApiFieldFact;

export interface OpenApiOperationFact extends OpenAPIV3.OperationObject {
  pathPattern: string;
  method: string;
}

export interface OpenApiBodyFact {
  contentType: string;
  flatSchema: OpenAPIV3.SchemaObject;
}

export interface OpenApiFieldFact {
  key: string;
  required: boolean;
  flatSchema: OpenAPIV3.SchemaObject;
}
export interface OpenApiResponseFact {
  statusCode: number;
}
export interface OpenApiRequestFact {}

export interface OpenApiHeaderFact extends OpenAPIV3.HeaderObject {
  name: string;
}

export interface OpenApiRequestParameterFact {}
