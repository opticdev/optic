import { OpenAPIV3 } from "openapi-types";

//@TODO: figure out what other info downstream tools will need
export interface ConceptualLocation {
  path: string;
  method: string;
  inRequest?: {
    header?: string;
    path?: string;
    query?: string;
    body?: {
      contentType: string;
    };
  };
  inResponse?: {
    header?: string;
    query?: string;
    body?: {
      contentType: string;
    };
    statusCode: string;
  };
  jsonSchemaTrail?: string[];
}

export enum OpenApiKind {
  Operation = "operation",
  Request = "request",
  QueryParameter = "query-parameter",
  PathParameter = "path-parameter",
  HeaderParameter = "header-parameter",
  ResponseHeader = "response-header",
  Response = "response",
  Body = "body",
  Object = "object",
  Field = "field",
  Array = "array",
  Primitive = "primitive",
}

export type OpenApiFact =
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
export interface OpenApiResponseFact
  extends Omit<OpenAPIV3.ResponseObject, "headers" | "content"> {
  statusCode: number;
}
export interface OpenApiRequestFact {}

export interface OpenApiHeaderFact extends OpenAPIV3.HeaderObject {
  name: string;
}

export interface OpenApiRequestParameterFact
  extends OpenAPIV3.ParameterObject {}


export class FactAccumulator<KindSchema> {
  constructor(private facts: IFact<KindSchema>[]) {}
  log(fact: IFact<KindSchema>) {
    this.facts.push(fact);
  }

  allFacts() {
    return this.facts;
  }
}

export interface Traverse<DocSchema, FactSchema> {
  format: string;
  traverse(input: DocSchema): void;
  accumulator: FactAccumulator<FactSchema>;
}

export interface IFact<KindSchema> {
  location: ILocation;
  value: KindSchema;
}

export type IPathComponent = string | number;
export type I = string | number;

export interface ILocation {
  jsonPath: string;
  conceptualPath: IPathComponent[];
  conceptualLocation: ConceptualLocation;
  kind: string;
}

export interface IChange<T> {
  location: ILocation;
  added?: T;
  changed?: {
    before: T;
    after: T;
  };
  removed?: {
    before: T;
  };
}
