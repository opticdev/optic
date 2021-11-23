import { OpenApiKind } from './openApiKinds';

type ConceptualLocationBase = {
  path: string;
  method: string;
};

export type OperationLocation = ConceptualLocationBase & {
  inRequest?: undefined;
  inResponse?: undefined;
  jsonSchemaTrail?: undefined;
};

export type QueryParameterLocation = ConceptualLocationBase & {
  inRequest: {
    header?: undefined;
    path?: undefined;
    query: string;
    body?: undefined;
  };
  inResponse?: undefined;
  jsonSchemaTrail?: undefined;
};

export type PathParameterLocation = ConceptualLocationBase & {
  inRequest: {
    header?: undefined;
    path: string;
    query?: undefined;
    body?: undefined;
  };
  inResponse?: undefined;
  jsonSchemaTrail?: undefined;
};

export type HeaderParameterLocation = ConceptualLocationBase & {
  inRequest: {
    header?: string;
    path?: undefined;
    query?: undefined;
    body?: undefined;
  };
  inResponse?: undefined;
  jsonSchemaTrail?: undefined;
};

export type ResponseHeaderLocation = ConceptualLocationBase & {
  inRequest?: undefined;
  inResponse: {
    header: string;
    query?: undefined;
    body?: undefined;
    statusCode: string;
  };
  jsonSchemaTrail?: undefined;
};

export type ResponseLocation = ConceptualLocationBase & {
  inRequest?: undefined;
  inResponse: {
    header?: undefined;
    query?: undefined;
    body?: undefined;
    statusCode: string;
  };
  jsonSchemaTrail?: undefined;
};

export type BodyLocation = ConceptualLocationBase &
  // Request body
  (| {
        inRequest: {
          header?: undefined;
          path?: undefined;
          query?: undefined;
          body: {
            contentType: string;
          };
        };
        inResponse?: undefined;
        jsonSchemaTrail?: undefined;
      }
    | {
        inRequest?: undefined;
        inResponse: {
          header?: undefined;
          query?: undefined;
          body: {
            contentType: string;
          };
          statusCode: string;
        };
        jsonSchemaTrail?: undefined;
      }
  );

export type FieldLocation = ConceptualLocationBase &
  (
    | {
        inRequest: {
          header?: undefined;
          path?: undefined;
          query?: undefined;
          body: {
            contentType: string;
          };
        };
        inResponse?: undefined;
        jsonSchemaTrail: string[];
      }
    | {
        inRequest?: undefined;
        inResponse: {
          header?: undefined;
          query?: undefined;
          body: {
            contentType: string;
          };
          statusCode: string;
        };
        jsonSchemaTrail: string[];
      }
  );

export type IPathComponent = string;

export type ILocation = {
  jsonPath: string;
  conceptualPath: IPathComponent[];
} & (
  | {
      conceptualLocation: OperationLocation;
      kind: OpenApiKind.Operation;
    }
  | {
      conceptualLocation: QueryParameterLocation;
      kind: OpenApiKind.QueryParameter;
    }
  | {
      conceptualLocation: PathParameterLocation;
      kind: OpenApiKind.PathParameter;
    }
  | {
      conceptualLocation: HeaderParameterLocation;
      kind: OpenApiKind.HeaderParameter;
    }
  | {
      conceptualLocation: ResponseHeaderLocation;
      kind: OpenApiKind.ResponseHeader;
    }
  | { conceptualLocation: ResponseLocation; kind: OpenApiKind.Response }
  | { conceptualLocation: BodyLocation; kind: OpenApiKind.Body }
  | { conceptualLocation: FieldLocation; kind: OpenApiKind.Field }
);
