import { FactAccumulator, Traverse } from "../../sdk/types";
import { IPathComponent } from "../../sdk/types";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import ResponseObject = OpenAPIV3_1.ResponseObject;

export class OpenAPITraverser
  implements Traverse<OpenAPIV3.Document, OpenAPIFacts>
{
  format = "openapi3";
  accumulator = new FactAccumulator<OpenAPIFacts>([]);

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
    const conceptualPath = ["operations", pathPattern, method];
    this.onOperation(
      operation,
      pathPattern,
      method,
      ["paths", pathPattern, method],
      ["operations", pathPattern, method]
    );

    Object.entries(operation.responses).forEach(([statusCode, response]) => {
      this.traverseResponse(
        response as ResponseObject,
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
    Object.entries(response.content || {}).forEach(([contentType, body]) => {
      this.traverseBody(
        body,
        contentType,
        [...jsonPath, "content", contentType, "body"],
        [...conceptualPath, contentType]
      );
    });
    this.onResponse(response, statusCode, jsonPath, conceptualPath);
  }

  traverseBody(
    body: OpenAPIV3.MediaTypeObject,
    contentType: string,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[]
  ) {
    if (body.schema && Object.keys(body.schema).length) {
      this.onContentForBody(body, contentType, jsonPath, conceptualPath);
      this.traverseSchema(body, jsonPath, conceptualPath);
    }
  }

  traverseField(
    key: string,
    schema: OpenAPIV3.SchemaObject,
    required: boolean,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[]
  ) {
    this.onField(key, schema, required, jsonPath, conceptualPath);
    this.traverseSchema(schema, jsonPath, conceptualPath);
  }

  traverseSchema(
    schema: OpenAPIV3.SchemaObject,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[]
  ) {
    if (schema.oneOf || schema.anyOf || schema.allOf) {
      // iterate these, multiple branches at path
    }
    switch (schema.type) {
      case "object":
        Object.entries(schema.properties || {}).forEach(([key, fieldSchema]) =>
          this.traverseField(
            key,
            fieldSchema as OpenAPIV3.SchemaObject,
            (schema.required || []).includes(key),
            [...jsonPath, "properties", key],
            [...conceptualPath, key]
          )
        );
        break;
      case "array":
        break;
      case "string":
      case "number":
      case "integer":
        break;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////

  onContentForBody(
    body: OpenAPIV3.MediaTypeObject,
    contentType: string,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[]
  ) {
    const value: OpenApiBodyFact = {
      contentType,
      schema: (body.schema || {}) as OpenAPIV3.SchemaObject,
    };
    this.accumulator.log({
      location: {
        jsonPath,
        conceptualPath,
        kind: "body",
      },
      value,
    });
  }

  onField(
    key: string,
    schema: OpenAPIV3.SchemaObject,
    required: boolean,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[]
  ) {
    const value: OpenApiFieldFact = {
      key,
      schema,
      required,
    };
    this.accumulator.log({
      location: {
        jsonPath,
        conceptualPath,
        kind: "field",
      },
      value,
    });
  }

  onOperation(
    operation: OpenAPIV3.OperationObject,
    pathPattern: string,
    method: string,
    jsonPath: IPathComponent[],
    conceptualPath: IPathComponent[]
  ) {
    const maturity: string | undefined =
      (operation as any)["x-maturity"] || undefined;
    const value: OpenApiEndpointFact = {
      summary: operation.summary || "",
      method,
      pathPattern,
      maturity,
    };
    this.accumulator.log({
      location: {
        jsonPath,
        conceptualPath,
        kind: "endpoint",
        stableId: operation.operationId,
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
    const value: OpenApiResponseFact = {
      statusCode: parseInt(statusCode),
    };
    this.accumulator.log({
      location: {
        jsonPath,
        conceptualPath,
        kind: "response",
        stableId: JSON.stringify(conceptualPath),
      },
      value,
    });
  }
}

type OpenAPIFacts =
  | OpenApiEndpointFact
  | OpenApiResponseFact
  | OpenApiBodyFact
  | OpenApiFieldFact;

export interface OpenApiEndpointFact {
  pathPattern: string;
  method: string;
  summary: string;
  maturity?: string;
}

export interface OpenApiBodyFact {
  contentType: string;
  schema: OpenAPIV3.SchemaObject;
}

export interface OpenApiFieldFact {
  key: string;
  required: boolean;
  schema: OpenAPIV3.SchemaObject;
}
export interface OpenApiResponseFact {
  statusCode: number;
}
