//todo one time export from scala js, switch to types from Rust
export interface IInteractionTrail {
  path: IInteractionTrailPathComponent[];
}

export type IInteractionTrailPathComponent =
  | IResponseHeaders
  | IResponseBody
  | IQueryString
  | IUrl
  | IRequestBody
  | IRequestHeaders
  | IMethod
  | IResponseStatusCode;

export interface IResponseHeaders {
  ResponseHeaders: {
    headerName: string;
  };
}

export interface IResponseBody {
  ResponseBody: {
    contentType: string;
    statusCode: number;
  };
}

export interface IQueryString {
  QueryString: {
    queryString: string;
  };
}

export interface IUrl {
  Url: {};
}

export interface IRequestBody {
  RequestBody: {
    contentType: string;
  };
}

export interface IRequestHeaders {
  RequestHeaders: {
    headerName: string;
  };
}

export interface IMethod {
  Method: {
    method: string;
  };
}

export interface IResponseStatusCode {
  ResponseStatusCode: {
    statusCode: number;
  };
}
