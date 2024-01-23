export enum OpenApiKind {
  Specification = 'specification',
  Operation = 'operation',
  Request = 'request',
  QueryParameter = 'query-parameter',
  PathParameter = 'path-parameter',
  HeaderParameter = 'header-parameter',
  CookieParameter = 'cookie-parameter',
  ResponseHeader = 'response-header',
  Response = 'response',
  Body = 'body',
  BodyExample = 'body-example',
  Field = 'field',
  Schema = 'schema',
  ComponentSchemaExample = 'component-schema-example',
}

export type OpenApiParameterKind = Extract<
  OpenApiKind,
  | OpenApiKind.HeaderParameter
  | OpenApiKind.PathParameter
  | OpenApiKind.QueryParameter
  | OpenApiKind.CookieParameter
>;

// allow for iterations and `.includes` calls
export const OpenApiParameterKind: OpenApiKind[] = [
  OpenApiKind.HeaderParameter,
  OpenApiKind.PathParameter,
  OpenApiKind.QueryParameter,
  OpenApiKind.CookieParameter,
];
