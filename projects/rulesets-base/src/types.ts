import { FactVariant, OpenApiKind } from '@useoptic/openapi-utilities';

export type FactVariantWithRaw<T extends OpenApiKind> = FactVariant<T> & {
  // TODO add in typings from OAS3? Or how do we pick the correct variant based on rules
  raw: any;
};

// Value constructs
export type RuleContext = {
  specification: Specification & {
    change: 'added' | 'changed' | 'removed' | null;
  };
  operation: Operation & {
    change: 'added' | 'changed' | 'removed' | null;
  };
  custom: any; // user defined context
};

export type Field = FactVariantWithRaw<OpenApiKind.Field>;

export type Specification = FactVariantWithRaw<OpenApiKind.Specification>;

export type Operation = FactVariantWithRaw<OpenApiKind.Operation> & {
  path: string;
  method: string;
  queryParameters: Map<string, FactVariantWithRaw<OpenApiKind.QueryParameter>>;
  pathParameters: Map<string, FactVariantWithRaw<OpenApiKind.PathParameter>>;
  headerParameters: Map<
    string,
    FactVariantWithRaw<OpenApiKind.HeaderParameter>
  >;
  cookieParameters: Map<
    string,
    FactVariantWithRaw<OpenApiKind.CookieParameter>
  >;
  requests: RequestBody[];
  responses: Map<string, Response>;
};

export type RequestBody = FactVariantWithRaw<OpenApiKind.Body> & {
  contentType: string;
  properties: Map<string, Field>;
};

export type Response = FactVariantWithRaw<OpenApiKind.Response> & {
  statusCode: string;
  headers: Map<string, FactVariantWithRaw<OpenApiKind.ResponseHeader>>;
  bodies: ResponseBody[];
};

export type ResponseBody = FactVariantWithRaw<OpenApiKind.Body> & {
  contentType: string;
  statusCode: string;
  properties: Map<string, Field>;
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
  | 'property';

export type AssertionTypeToValue = {
  specification: Specification;
  operation: Operation;
  'query-parameter': FactVariantWithRaw<OpenApiKind.QueryParameter>;
  'path-parameter': FactVariantWithRaw<OpenApiKind.PathParameter>;
  'header-parameter': FactVariantWithRaw<OpenApiKind.HeaderParameter>;
  'cookie-parameter': FactVariantWithRaw<OpenApiKind.CookieParameter>;
  'response-header': FactVariantWithRaw<OpenApiKind.ResponseHeader>;
  response: Response;
  'request-body': RequestBody;
  'response-body': ResponseBody;
  property: FactVariantWithRaw<OpenApiKind.Field>;
};

type MatchesFn = (
  structure: any,
  options?: {
    strict?: boolean;
  }
) => void;
export type AssertionTypeToHelpers = {
  specification: { matches: MatchesFn };
  operation: {
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
  };
  'query-parameter': {};
  'path-parameter': {};
  'header-parameter': {};
  'cookie-parameter': {};
  response: {
    hasResponseHeaderMatching: (
      name: string,
      structure: any,
      options?: {
        strict?: boolean;
      }
    ) => void;
  };
  'response-header': {};
  'request-body': { matches: MatchesFn };
  'response-body': { matches: MatchesFn };
  property: {};
};

export type Assertion<T extends AssertionType> = (
  condition: string,
  assertion: (value: AssertionTypeToValue[T]) => void
) => void;

export type ChangedAssertion<T extends AssertionType> = (
  condition: string,
  assertion: (
    before: AssertionTypeToValue[T],
    after: AssertionTypeToValue[T]
  ) => void
) => void;

export type Assertions<T extends AssertionType> = {
  requirement: AssertionTypeToHelpers[T] & Assertion<T>;
  added: AssertionTypeToHelpers[T] & Assertion<T>;
  changed: AssertionTypeToHelpers[T] & ChangedAssertion<T>;
  removed: AssertionTypeToHelpers[T] & Assertion<T>;
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
};

export type ResponseAssertions = Assertions<'response'> & {
  header: Assertions<'response-header'>;
};

export type ResponseBodyAssertions = {
  body: Assertions<'response-body'>;
  property: Assertions<'property'>;
};
