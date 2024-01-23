import { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import { LookupLineResultWithFilepath } from '../../../types';
import {
  ILocation,
  IPathComponent,
  OperationLocation,
  QueryParameterLocation,
  PathParameterLocation,
  HeaderParameterLocation,
  CookieParameterLocation,
  ResponseHeaderLocation,
  ResponseLocation,
  RequestLocation,
  BodyLocation,
  BodyExampleLocation,
  FieldLocation,
  ComponentSchemaLocation,
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
  CookieParameterLocation,
  ResponseHeaderLocation,
  ResponseLocation,
  RequestLocation,
  BodyLocation,
  BodyExampleLocation,
  FieldLocation,
  ComponentSchemaLocation,
};
export type ConceptualLocation = ILocation['conceptualLocation'];

export type OpenApiFact =
  | OpenApiOperationFact
  | OpenApiRequestFact
  | OpenApiRequestParameterFact
  | OpenApiResponseFact
  | OpenApiHeaderFact
  | OpenApiBodyFact
  | OpenApiBodyExampleFact
  | OpenApiFieldFact
  | OpenApiSpecificationFact
  | OpenApiComponentSchemaExampleFact
  | OpenApiSchemaFact;

export interface OpenApiSpecificationFact
  extends Omit<OpenAPIV3.Document, 'paths' | 'components'> {}

export interface OpenApiOperationFact
  extends Omit<
    OpenAPIV3.OperationObject,
    'parameters' | 'responses' | 'requestBody'
  > {
  pathPattern: string;
  method: string;
}

export type OpenApi3SchemaFact = Omit<
  OpenAPIV3_1.SchemaObject,
  'item' | 'required' | 'properties'
>;

export interface OpenApiBodyFact {
  contentType: string;
  flatSchema: OpenApi3SchemaFact;
}

export interface OpenApiSchemaFact {
  flatSchema: OpenApi3SchemaFact;
}

export interface OpenApiBodyExampleFact extends OpenAPIV3.ExampleObject {
  contentType: string;
  name?: string;
}

export interface OpenApiFieldFact {
  key: string;
  required: boolean;
  flatSchema: OpenApi3SchemaFact;
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

export interface OpenApiComponentSchemaExampleFact {
  value: any;
}

export interface Traverse<DocSchema> {
  format: string;
  traverse(input: DocSchema): void;
  facts(): IterableIterator<IFact>;
}

export type OpenApiKindToFact = {
  [OpenApiKind.Specification]: OpenApiSpecificationFact;
  [OpenApiKind.Operation]: OpenApiOperationFact;
  [OpenApiKind.Request]: OpenApiRequestFact;
  [OpenApiKind.QueryParameter]: OpenApiRequestParameterFact;
  [OpenApiKind.PathParameter]: OpenApiRequestParameterFact;
  [OpenApiKind.HeaderParameter]: OpenApiRequestParameterFact;
  [OpenApiKind.CookieParameter]: OpenApiRequestParameterFact;
  [OpenApiKind.ResponseHeader]: OpenApiHeaderFact;
  [OpenApiKind.Response]: OpenApiResponseFact;
  [OpenApiKind.Body]: OpenApiBodyFact;
  [OpenApiKind.BodyExample]: OpenApiBodyExampleFact;
  [OpenApiKind.Field]: OpenApiFieldFact;
  [OpenApiKind.ComponentSchemaExample]: OpenApiComponentSchemaExampleFact;
  [OpenApiKind.Schema]: OpenApiSchemaFact;
};

export interface FactVariant<FactKind extends OpenApiKind> {
  location: Extract<ILocation, { kind: FactKind }>;
  value: OpenApiKindToFact[FactKind];
}
export enum ChangeType {
  Added = 'added',
  Changed = 'changed',
  Removed = 'removed',
}

export type ChangeVariant<FactKind extends OpenApiKind> = {
  location: Extract<ILocation, { kind: FactKind }> & {
    sourcemap?: LookupLineResultWithFilepath;
  };
} & (
  | {
      changeType: ChangeType.Added;
      added: OpenApiKindToFact[FactKind];
      changed?: undefined;
      removed?: undefined;
    }
  | {
      changeType: ChangeType.Changed;
      added?: undefined;
      changed: {
        before: OpenApiKindToFact[FactKind];
        after: OpenApiKindToFact[FactKind];
      };
      removed?: undefined;
    }
  | {
      changeType: ChangeType.Removed;
      added?: undefined;
      changed?: undefined;
      removed: {
        before: OpenApiKindToFact[FactKind];
      };
    }
);

export type IFact =
  | FactVariant<OpenApiKind.Specification>
  | FactVariant<OpenApiKind.Operation>
  | FactVariant<OpenApiKind.Request>
  | FactVariant<OpenApiKind.QueryParameter>
  | FactVariant<OpenApiKind.PathParameter>
  | FactVariant<OpenApiKind.HeaderParameter>
  | FactVariant<OpenApiKind.CookieParameter>
  | FactVariant<OpenApiKind.ResponseHeader>
  | FactVariant<OpenApiKind.Response>
  | FactVariant<OpenApiKind.Body>
  | FactVariant<OpenApiKind.BodyExample>
  | FactVariant<OpenApiKind.Field>
  | FactVariant<OpenApiKind.ComponentSchemaExample>
  | FactVariant<OpenApiKind.Schema>;

export type IChange =
  | ChangeVariant<OpenApiKind.Specification>
  | ChangeVariant<OpenApiKind.Operation>
  | ChangeVariant<OpenApiKind.Request>
  | ChangeVariant<OpenApiKind.QueryParameter>
  | ChangeVariant<OpenApiKind.PathParameter>
  | ChangeVariant<OpenApiKind.HeaderParameter>
  | ChangeVariant<OpenApiKind.CookieParameter>
  | ChangeVariant<OpenApiKind.ResponseHeader>
  | ChangeVariant<OpenApiKind.Response>
  | ChangeVariant<OpenApiKind.Body>
  | ChangeVariant<OpenApiKind.BodyExample>
  | ChangeVariant<OpenApiKind.Field>
  | ChangeVariant<OpenApiKind.ComponentSchemaExample>
  | ChangeVariant<OpenApiKind.Schema>;
