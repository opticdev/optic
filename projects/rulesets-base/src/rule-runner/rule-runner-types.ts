import {
  ChangeVariant,
  FactVariant,
  OpenApiKind,
} from '@useoptic/openapi-utilities';

export type RulesetData = {
  aliases: string[];
};

export type NodeDetail<T extends OpenApiKind> = {
  before: FactVariant<T> | null;
  after: FactVariant<T> | null;
  change: ChangeVariant<T> | null;
};

type ContentType = string;
type StatusCode = string;

export type HeaderParameterNode = NodeDetail<OpenApiKind.HeaderParameter>;
export type PathParameterNode = NodeDetail<OpenApiKind.PathParameter>;
export type QueryParameterNode = NodeDetail<OpenApiKind.QueryParameter>;

export type RequestNode = NodeDetail<OpenApiKind.Request> & {
  bodies: Map<ContentType, BodyNode>;
};

export type ResponseNode = NodeDetail<OpenApiKind.Response> & {
  statusCode: string;
  headers: Map<string, NodeDetail<OpenApiKind.ResponseHeader>>;
  bodies: Map<ContentType, BodyNode>;
};

export type BodyNode = NodeDetail<OpenApiKind.Body> & {
  fields: Map<string, NodeDetail<OpenApiKind.Field>>;
};

export type EndpointNode = NodeDetail<OpenApiKind.Operation> & {
  method: string;
  path: string;

  headerParameters: Map<string, HeaderParameterNode>;
  pathParameters: Map<string, PathParameterNode>;
  queryParameters: Map<string, QueryParameterNode>;
  request: RequestNode;
  responses: Map<StatusCode, ResponseNode>;
};

export type OpenApiDocument = {
  specification: NodeDetail<OpenApiKind.Specification>;
  endpoints: Map<string, EndpointNode>;
};
