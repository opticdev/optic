import {
  FactVariant,
  OpenApiKind,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';

// Value constructs - these are types that represent the node you are working on
export type RuleContext = {
  specification: Specification & {
    change: 'added' | 'changed' | 'removed' | null;
    versionChange: 'major' | 'minor' | 'patch' | null;
  };
  operation: Operation & {
    change: 'added' | 'changed' | 'removed' | null;
  };
  custom: any; // user defined context
};

export type Specification = FactVariant<OpenApiKind.Specification> & {
  raw: OpenAPIV3.Document;
};

export type Operation = FactVariant<OpenApiKind.Operation> & {
  raw: OpenAPIV3.OperationObject;
  security: OpenAPIV3.OperationObject['security'] | null;
  polymorphicSchemas: { before: Set<string>; after: Set<string> };
  path: string;
  method: string;
  queryParameters: Map<string, QueryParameter>;
  pathParameters: Map<string, PathParameter>;
  headerParameters: Map<string, HeaderParameter>;
  cookieParameters: Map<string, CookieParameter>;
  requests: RequestBody[];
  responses: Map<string, Response>;
};

export type QueryParameter = FactVariant<OpenApiKind.QueryParameter> & {
  raw: OpenAPIV3.ParameterObject;
};

export type PathParameter = FactVariant<OpenApiKind.PathParameter> & {
  raw: OpenAPIV3.ParameterObject;
};

export type HeaderParameter = FactVariant<OpenApiKind.HeaderParameter> & {
  raw: OpenAPIV3.ParameterObject;
};

export type CookieParameter = FactVariant<OpenApiKind.CookieParameter> & {
  raw: OpenAPIV3.ParameterObject;
};

export type RequestBody = FactVariant<OpenApiKind.Body> & {
  raw: OpenAPIV3.MediaTypeObject;
  required?: boolean;
  contentType: string;
  properties: Map<string, Property>;
  schemas: Map<string, Schema>;
};

export type Property = FactVariant<OpenApiKind.Field> & {
  raw: OpenAPIV3.SchemaObject;
  parent: OpenAPIV3.NonArraySchemaObject;
};

export type Field = Property;

export type Schema = FactVariant<OpenApiKind.Schema> & {
  raw: OpenAPIV3.SchemaObject;
};

export type ResponseHeader = FactVariant<OpenApiKind.ResponseHeader> & {
  raw: OpenAPIV3.HeaderObject;
};

export type Response = FactVariant<OpenApiKind.Response> & {
  raw: OpenAPIV3.ResponseObject;
  statusCode: string;
  headers: Map<string, ResponseHeader>;
  bodies: ResponseBody[];
};

export type ResponseBody = FactVariant<OpenApiKind.Body> & {
  raw: OpenAPIV3.MediaTypeObject;
  contentType: string;
  statusCode: string;
  properties: Map<string, Field>;
  schemas: Map<string, Schema>;
};

// Assertions
export type AssertionType =
  | 'specification'
  | 'operation'
  | 'query-parameter'
  | 'path-parameter'
  | 'header-parameter'
  | 'cookie-parameter'
  | 'response'
  | 'response-header'
  | 'request-body'
  | 'response-body'
  | 'property'
  | 'schema';

export type AssertionTypeToValue = {
  specification: Specification;
  operation: Operation;
  'query-parameter': QueryParameter;
  'path-parameter': PathParameter;
  'header-parameter': HeaderParameter;
  'cookie-parameter': CookieParameter;
  'response-header': ResponseHeader;
  response: Response;
  'request-body': RequestBody;
  'response-body': ResponseBody;
  property: Field;
  schema: Schema;
};

type MatchesFn = (
  structure: any,
  options?: {
    strict?: boolean;
    errorMessage?: string;
  }
) => void;

type MatchesOneOfFn = (
  structures: any[],
  options?: {
    strict?: boolean;
    errorMessage?: string;
  }
) => void;

type SpecificationAssertionHelpers = {
  not: SpecificationAssertionHelpers;
  matches: MatchesFn;
  matchesOneOf: MatchesOneOfFn;
};

type OperationAssertionHelpers = {
  not: OperationAssertionHelpers;
  hasQueryParameterMatching: MatchesFn;
  hasPathParameterMatching: MatchesFn;
  hasHeaderParameterMatching: MatchesFn;
  hasCookieParameterMatching: MatchesFn;
  hasRequests: (
    requests: {
      contentType: string;
    }[]
  ) => void;
  hasResponses: (
    responses: {
      contentType?: string;
      statusCode: string;
    }[]
  ) => void;
  matches: MatchesFn;
  matchesOneOf: MatchesOneOfFn;
};

type ResponseAssertionHelpers = {
  not: ResponseAssertionHelpers;
  hasResponseHeaderMatching: (
    name: string,
    structure: any,
    options?: {
      strict?: boolean;
    }
  ) => void;
};

type RequestBodyAssertionHelpers = {
  not: AssertionTypeToHelpers['request-body'];
  matches: MatchesFn;
  matchesOneOf: MatchesOneOfFn;
};

type ResponseBodyAssertionHelpers = {
  not: AssertionTypeToHelpers['response-body'];
  matches: MatchesFn;
  matchesOneOf: MatchesOneOfFn;
};

export type AssertionTypeToHelpers = {
  specification: SpecificationAssertionHelpers;
  operation: OperationAssertionHelpers;
  'query-parameter': {};
  'path-parameter': {};
  'header-parameter': {};
  'cookie-parameter': {};
  response: ResponseAssertionHelpers;
  'response-header': {};
  'request-body': RequestBodyAssertionHelpers;
  'response-body': ResponseBodyAssertionHelpers;
  schema: {};
  property: {};
};

export type Assertion<T extends AssertionType> = (
  value: AssertionTypeToValue[T]
) => void;
export type RegisterAssertion<T extends AssertionType> = (
  ...args:
    | [condition: string, assertion: Assertion<T>]
    | [assertion: Assertion<T>]
) => void;

export type ChangedAssertion<T extends AssertionType> = (
  before: AssertionTypeToValue[T],
  after: AssertionTypeToValue[T]
) => void;
export type RegisterChangedAssertion<T extends AssertionType> = (
  ...args:
    | [condition: string, assertion: ChangedAssertion<T>]
    | [assertion: ChangedAssertion<T>]
) => void;

export type Assertions<T extends AssertionType> = {
  requirement: RegisterAssertion<T> & AssertionTypeToHelpers[T];
  added: RegisterAssertion<T> & AssertionTypeToHelpers[T];
  addedOrChanged: RegisterAssertion<T> & AssertionTypeToHelpers[T];
  changed: RegisterChangedAssertion<T> & AssertionTypeToHelpers[T];
  removed: RegisterAssertion<T> & AssertionTypeToHelpers[T];
};

export type SpecificationAssertions = Assertions<'specification'>;

export type OperationAssertions = Assertions<'operation'> & {
  queryParameter: Assertions<'query-parameter'>;
  pathParameter: Assertions<'path-parameter'>;
  headerParameter: Assertions<'header-parameter'>;
  cookieParameter: Assertions<'cookie-parameter'>;
};

export type RequestAssertions = {
  body: Assertions<'request-body'>;
  property: Assertions<'property'>;
  schema: Assertions<'schema'>;
};

export type ResponseAssertions = Assertions<'response'> & {
  header: Assertions<'response-header'>;
};

export type ResponseBodyAssertions = {
  body: Assertions<'response-body'>;
  property: Assertions<'property'>;
  schema: Assertions<'schema'>;
};

export type PropertyAssertions = Assertions<'property'>;
