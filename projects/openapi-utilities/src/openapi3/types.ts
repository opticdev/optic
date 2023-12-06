import { OpenAPI, OpenAPIV3 } from 'openapi-types';

export type V3FactType =
  | 'specification'
  | 'path'
  | 'operation'
  | 'request-header'
  | 'request-query'
  | 'request-cookie'
  | 'request-path'
  | 'body'
  | 'requestBody'
  | 'field'
  | 'response'
  | 'response-header'
  | 'body-example'
  | 'body-examples'
  | 'component-schema-example';

type _OpenApiV3TraverserFact<T extends V3FactType> = {
  location: {
    jsonPath: string;
  };
  type: T;
};

export type OpenApiV3TraverserFact<T extends V3FactType> = T extends T
  ? _OpenApiV3TraverserFact<T>
  : never;

export type FactLocation<T extends V3FactType> = T extends 'specification'
  ? {}
  : T extends 'path'
    ? { pathPattern: string }
    : T extends
          | 'operation'
          | 'request-header'
          | 'request-query'
          | 'request-cookie'
          | 'request-path'
          | 'requestBody'
      ? { pathPattern: string; method: string }
      : T extends 'body'
        ?
            | {
                location: 'response';
                pathPattern: string;
                method: string;
                statusCode: string;
                contentType: string;
              }
            | {
                location: 'request';
                pathPattern: string;
                method: string;
                contentType: string;
              }
        : T extends 'body-example' | 'body-examples'
          ?
              | {
                  location: 'response';
                  pathPattern: string;
                  method: string;
                  statusCode: string;
                  contentType: string;
                  trail: string[];
                }
              | {
                  location: 'request';
                  pathPattern: string;
                  method: string;
                  contentType: string;
                  trail: string[];
                }
          : T extends 'field'
            ?
                | {
                    location: 'response';
                    pathPattern: string;
                    method: string;
                    statusCode: string;
                    contentType: string;
                    trail: string[];
                  }
                | {
                    location: 'request';
                    pathPattern: string;
                    method: string;
                    contentType: string;
                    trail: string[];
                  }
            : T extends 'response'
              ? { pathPattern: string; method: string; statusCode: string }
              : T extends 'response-header'
                ? {
                    pathPattern: string;
                    method: string;
                    statusCode: string;
                    headerName: string;
                  }
                : T extends 'component-schema-example'
                  ? {}
                  : never;

export type FactRawItem<T extends V3FactType> = T extends 'specification'
  ? OpenAPIV3.Document
  : T extends 'path'
    ? OpenAPIV3.PathItemObject
    : T extends 'operation'
      ? OpenAPIV3.OperationObject
      : T extends 'request-header'
        ? OpenAPIV3.ParameterObject
        : T extends 'request-query'
          ? OpenAPIV3.ParameterObject
          : T extends 'request-cookie'
            ? OpenAPIV3.ParameterObject
            : T extends 'request-path'
              ? OpenAPIV3.ParameterObject
              : T extends 'body'
                ? OpenAPIV3.MediaTypeObject
                : T extends 'requestBody'
                  ? OpenAPIV3.RequestBodyObject
                  : T extends 'field'
                    ? OpenAPIV3.SchemaObject
                    : T extends 'response'
                      ? OpenAPIV3.ResponseObject
                      : T extends 'response-header'
                        ? OpenAPIV3.HeaderObject
                        : T extends 'body-example'
                          ? NonNullable<OpenAPIV3.MediaTypeObject['example']>
                          : T extends 'body-examples'
                            ? OpenAPIV3.ExampleObject
                            : T extends 'component-schema-example'
                              ? OpenAPIV3.ExampleObject
                              : never;
