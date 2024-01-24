import { OpenApiKind } from './openApiKinds';

export type OperationLocation = {
  path: string;
  method: string;
};

export type QueryParameterLocation = OperationLocation & {
  inRequest: {
    query: string;
  };
};

export type PathParameterLocation = OperationLocation & {
  inRequest: {
    path: string;
  };
};

export type HeaderParameterLocation = OperationLocation & {
  inRequest: {
    header: string;
  };
};

export type CookieParameterLocation = OperationLocation & {
  inRequest: {
    cookie: string;
  };
};

export type ResponseHeaderLocation = OperationLocation & {
  inResponse: {
    header: string;
    statusCode: string;
  };
};

export type RequestLocation = OperationLocation & {
  inRequest: {};
};

export type ResponseLocation = OperationLocation & {
  inResponse: {
    statusCode: string;
  };
};

export type BodyLocation = OperationLocation &
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

export type FieldLocation = OperationLocation &
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

type SchemaContext =
  | {
      type: 'polymorphic';
      key: 'oneOf' | 'anyOf' | 'allOf';
    }
  | {
      type: 'field';
      key: string;
      required: boolean;
    }
  | {
      type: 'array';
    }
  | {
      type: 'body';
    };

export type SchemaLocation = OperationLocation &
  (
    | {
        inRequest: {
          body: {
            contentType: string;
          };
        };
        jsonSchemaTrail: string[];
        context: SchemaContext;
      }
    | {
        inResponse: {
          body: {
            contentType: string;
          };
          statusCode: string;
        };
        jsonSchemaTrail: string[];
        context: SchemaContext;
      }
  );

export type ComponentSchemaLocation = {
  inComponentSchema: {
    schemaName: string;
  };
};

export type IPathComponent = string;

export type ILocation = {
  jsonPath: string;
  conceptualPath: IPathComponent[];
} & (
  | {
      conceptualLocation: {};
      kind: OpenApiKind.Specification;
    }
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
      conceptualLocation: CookieParameterLocation;
      kind: OpenApiKind.CookieParameter;
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
  | { conceptualLocation: SchemaLocation; kind: OpenApiKind.Schema }
  | {
      conceptualLocation: ComponentSchemaLocation;
      kind: OpenApiKind.ComponentSchemaExample;
    }
);
