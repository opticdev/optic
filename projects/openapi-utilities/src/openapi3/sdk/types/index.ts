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
  RequestLocation,
  BodyLocation,
  FieldLocation,
} from './location';
import { OpenApiKind, OpenApiParameterKind } from './openApiKinds';

export {
  ILocation,
  IPathComponent,
  OpenApiKind,
  OpenApiParameterKind,
  OperationLocation,
  QueryParameterLocation,
  PathParameterLocation,
  HeaderParameterLocation,
  ResponseHeaderLocation,
  ResponseLocation,
  RequestLocation,
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

export interface OpenApiOperationFact
  extends Omit<
    OpenAPIV3.OperationObject,
    'parameters' | 'responses' | 'requestBody'
  > {
  pathPattern: string;
  method: string;
}

export interface OpenApiBodyFact {
  contentType: string;
  flatSchema: Omit<OpenAPIV3.SchemaObject, 'item' | 'required' | 'properties'>;
}

export interface OpenApiFieldFact {
  key: string;
  required: boolean;
  flatSchema: Omit<OpenAPIV3.SchemaObject, 'item' | 'required' | 'properties'>;
}
export interface OpenApiResponseFact
  extends Omit<OpenAPIV3.ResponseObject, 'headers' | 'content'> {
  statusCode: string;
}
export interface OpenApiRequestFact
  extends Omit<OpenAPIV3.RequestBodyObject, 'content'> {}

export interface OpenApiHeaderFact extends OpenAPIV3.HeaderObject {
  name: string;
}

export interface OpenApiRequestParameterFact
  extends OpenAPIV3.ParameterObject {}

// TODO: remove accumulator for next MAJOR / BREAKING change
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
  // TODO: remove accumulator for next MAJOR / BREAKING change
  accumulator: FactAccumulator<FactSchema>;
}

export interface IFact<KindSchema> {
  location: ILocation;
  value: KindSchema;
}

export enum ChangeType {
  Added = 'added',
  Changed = 'changed',
  Removed = 'removed',
}

type BaseChange = {
  location: ILocation;
};

export type IChange<T> = BaseChange &
  (
    | {
        changeType: ChangeType.Added;
        added: T;
        changed?: undefined;
        removed?: undefined;
      }
    | {
        changeType: ChangeType.Changed;
        added?: undefined;
        changed: {
          before: T;
          after: T;
        };
        removed?: undefined;
      }
    | {
        changeType: ChangeType.Removed;
        added?: undefined;
        changed?: undefined;
        removed: {
          before: T;
        };
      }
  );
