import { OpenAPIV3 } from 'openapi-types';
import {
  ILocation,
  IPathComponent,
  OperationLocation,
  QueryParameterLocation,
  PathParameterLocation,
  HeaderParameterLocation,
  ResponseHeaderLocation,
  ResponseLocation,
  BodyLocation,
  FieldLocation,
} from './location';
import { OpenApiKind } from './openApiKinds';

export {
  ILocation,
  IPathComponent,
  OpenApiKind,
  OperationLocation,
  QueryParameterLocation,
  PathParameterLocation,
  HeaderParameterLocation,
  ResponseHeaderLocation,
  ResponseLocation,
  BodyLocation,
  FieldLocation,
};
export type ConceptualLocation = ILocation['conceptualLocation'];

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
  extends Omit<OpenAPIV3.ResponseObject, 'headers' | 'content'> {
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
