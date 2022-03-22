import { OpenApiKind } from './openApiKinds';

type ConceptualLocationBase = {
  path: string;
  method: string;
};

export type OperationLocation = ConceptualLocationBase;

export type QueryParameterLocation = ConceptualLocationBase & {
  inRequest: {
    query: string;
  };
};

export type PathParameterLocation = ConceptualLocationBase & {
  inRequest: {
    path: string;
  };
};

export type HeaderParameterLocation = ConceptualLocationBase & {
  inRequest: {
    header: string;
  };
};

export type ResponseHeaderLocation = ConceptualLocationBase & {
  inResponse: {
    header: string;
    statusCode: string;
  };
};

export type RequestLocation = ConceptualLocationBase & {
  inRequest: {};
};

export type ResponseLocation = ConceptualLocationBase & {
  inResponse: {
    statusCode: string;
  };
};

export type BodyLocation = ConceptualLocationBase &
  // Request body
  (| {
        inRequest: {
          body: {
            contentType: string;
          };
        };
      }
    | {
        inResponse: {
          body: {
            contentType: string;
          };
          statusCode: string;
        };
      }
  );

export type BodyExampleLocation = BodyLocation &
  (
    | {
        singular: true; // for use of `example: ExampleObject`
      }
    | {
        name: string; // for use of `examples: { [name: string]: ExampleObject }`
      }
  );

export type FieldLocation = ConceptualLocationBase &
  (
    | {
        inRequest: {
          body: {
            contentType: string;
          };
        };
        jsonSchemaTrail: string[];
      }
    | {
        inResponse: {
          body: {
            contentType: string;
          };
          statusCode: string;
        };
        jsonSchemaTrail: string[];
      }
  );

export type ComponentSchemaLocation = {
  schemaName: string;
};

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
  | { conceptualLocation: RequestLocation; kind: OpenApiKind.Request }
  | { conceptualLocation: BodyLocation; kind: OpenApiKind.Body }
  | { conceptualLocation: BodyExampleLocation; kind: OpenApiKind.BodyExample }
  | { conceptualLocation: FieldLocation; kind: OpenApiKind.Field }
  | {
      conceptualLocation: ComponentSchemaLocation;
      kind: OpenApiKind.ComponentSchemaExample;
    }
);
