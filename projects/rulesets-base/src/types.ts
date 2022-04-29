import { FactVariant, OpenApiKind } from '@useoptic/openapi-utilities';

export type FactVariantWithRaw<T extends OpenApiKind> = FactVariant<T> & {
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
  requests: Request[];
  responses: Response[];
};

export type Request = FactVariantWithRaw<OpenApiKind.Request> & {
  contentType: string;
  body: FactVariantWithRaw<OpenApiKind.Body>;
  properties: Map<string, Field>;
};

export type Response = FactVariantWithRaw<OpenApiKind.Response> & {
  contentType: string;
  statusCode: string;
  headers: Map<string, FactVariantWithRaw<OpenApiKind.ResponseHeader>>;
  body: FactVariantWithRaw<OpenApiKind.Body>;
  properties: Map<string, Field>;
};

// Assertions
export type AssertionType =
  | 'specification'
  | 'operation'
  | 'query-parameter'
  | 'path-parameter'
  | 'header-parameter'
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
  'response-header': FactVariantWithRaw<OpenApiKind.ResponseHeader>;
  'request-body': Request;
  'response-body': Response;
  property: FactVariantWithRaw<OpenApiKind.Field>;
};

export type AssertionTypeToHelpers = {
  specification: { matches: (structure: any) => void };
  operation: {
    hasStatusCodes: (statusCodes: number[]) => void;
    matches: (structure: any) => void;
  };
  'query-parameters': { matches: (structure: any) => void };
  'path-parameters': { matches: (structure: any) => void };
  'header-parameters': { matches: (structure: any) => void };
  request: { matches: (structure: any) => void };
  response: { matches: (structure: any) => void };
  'response-headers': { matches: (structure: any) => void };
  body: {
    matches: (structure: any) => void;
  };
  property: { matches: (structure: any) => void };
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
  requirement: /*AssertionTypeToHelpers[T] & */ Assertion<T>;
  added: /*AssertionTypeToHelpers[T] & */ Assertion<T>;
  changed: /*AssertionTypeToHelpers[T] & */ ChangedAssertion<T>;
  removed: /*AssertionTypeToHelpers[T] & */ Assertion<T>;
};

export type SpecificationAssertions = Assertions<'specification'>;

export type OperationAssertions = Assertions<'operation'> & {
  queryParameter: Assertions<'query-parameter'>;
  pathParameter: Assertions<'path-parameter'>;
  headerParameter: Assertions<'header-parameter'>;
};

export type RequestAssertions = {
  body: Assertions<'request-body'>;
  property: Assertions<'property'>;
};

export type ResponseAssertions = {
  header: Assertions<'response-header'>;
  body: Assertions<'response-body'>;
  property: Assertions<'property'>;
};
