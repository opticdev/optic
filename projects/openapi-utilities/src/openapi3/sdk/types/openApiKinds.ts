export enum OpenApiKind {
  Operation = 'operation',
  Request = 'request',
  QueryParameter = 'query-parameter',
  PathParameter = 'path-parameter',
  HeaderParameter = 'header-parameter',
  ResponseHeader = 'response-header',
  Response = 'response',
  Body = 'body',
  BodyExample = 'body-example',
  Object = 'object',
  Field = 'field',
  Array = 'array',
  Primitive = 'primitive',
}

export type OpenApiParameterKind = Extract<
  OpenApiKind,
  | OpenApiKind.HeaderParameter
  | OpenApiKind.PathParameter
  | OpenApiKind.QueryParameter
>;

// allow for iterations and `.includes` calls
export const OpenApiParameterKind: OpenApiKind[] = [
  OpenApiKind.HeaderParameter,
  OpenApiKind.PathParameter,
  OpenApiKind.QueryParameter,
];
