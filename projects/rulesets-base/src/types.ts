import { FactVariant, OpenApiKind } from '@useoptic/openapi-utilities';

type FactVariantWithRaw<T extends OpenApiKind> = FactVariant<T> & {
  // TODO add in typings from OAS3? Or how do we pick the correct variant based on rules
  raw: any;
};

// Value constructs
export type RuleContext = {
  operation: Operation & {
    change: 'added' | 'changed' | 'removed' | null;
  };
  custom: any; // user defined context
};

export type Specification = FactVariantWithRaw<OpenApiKind.Specification>;

export type Operation = FactVariantWithRaw<OpenApiKind.Operation> & {
  path: string;
  method: string;
  queryParameters: FactVariantWithRaw<OpenApiKind.QueryParameter>[];
  pathParameters: FactVariantWithRaw<OpenApiKind.PathParameter>[];
  headerParameters: FactVariantWithRaw<OpenApiKind.HeaderParameter>[];
  requests: Request[];
  responses: Response[];
};

export type Request = FactVariantWithRaw<OpenApiKind.Request> & {
  contentType: string;
  body: FactVariantWithRaw<OpenApiKind.Body>;
  properties: FactVariantWithRaw<OpenApiKind.Field>[];
};

export type Response = FactVariantWithRaw<OpenApiKind.Response> & {
  contentType: string;
  statusCode: string;
  headers: FactVariantWithRaw<OpenApiKind.ResponseHeader>[];
  body: FactVariantWithRaw<OpenApiKind.Body>;
  properties: FactVariantWithRaw<OpenApiKind.Field>[];
};

// Assertions
type AssertionType =
  | 'specification'
  | 'operation'
  | 'query-parameter'
  | 'path-parameter'
  | 'header-parameter'
  | 'request'
  | 'response'
  | 'response-header'
  | 'body'
  | 'property';

type AssertionTypeToValue = {
  specification: Specification;
  operation: Operation;
  'query-parameter': FactVariantWithRaw<OpenApiKind.QueryParameter>;
  'path-parameter': FactVariantWithRaw<OpenApiKind.PathParameter>;
  'header-parameter': FactVariantWithRaw<OpenApiKind.HeaderParameter>;
  request: Request;
  response: Response;
  'response-header': FactVariantWithRaw<OpenApiKind.ResponseHeader>;
  body: FactVariantWithRaw<OpenApiKind.Body>;
  property: FactVariantWithRaw<OpenApiKind.Field>;
};

type AssertionTypeToHelpers = {
  specification: { matches: (structure: any) => void };
  operation: {
    hasStatusCodes: (statusCodes: number[]) => void;
    matches: (structure: any) => void;
  };
  'query-parameter': { matches: (structure: any) => void };
  'path-parameter': { matches: (structure: any) => void };
  'header-parameter': { matches: (structure: any) => void };
  request: { matches: (structure: any) => void };
  response: { matches: (structure: any) => void };
  'response-header': { matches: (structure: any) => void };
  body: {
    matches: (structure: any) => void;
  };
  property: { matches: (structure: any) => void };
};

type Assertion<T extends AssertionType> = (
  assertion: (value: AssertionTypeToValue[T]) => void
) => void;

type ChangedAssertion<T extends AssertionType> = (
  assertion: (
    before: AssertionTypeToValue[T],
    after: AssertionTypeToValue[T],
    context: RuleContext
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
  queryParameters: Assertions<'query-parameter'>;
  pathParameters: Assertions<'path-parameter'>;
  headerParameters: Assertions<'header-parameter'>;
};

export type RequestAssertions = Assertions<'request'> & {
  body: Assertions<'body'>;
  property: Assertions<'property'>;
};

export type ResponseAssertions = Assertions<'response'> & {
  header: Assertions<'response-header'>;
  body: Assertions<'body'>;
  property: Assertions<'property'>;
};
