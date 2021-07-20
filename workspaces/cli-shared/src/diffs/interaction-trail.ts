//todo one time export from scala js, switch to types from Rust
export interface IInteractionTrail {
  path: IInteractionTrailPathComponent[];
}

type IInteractionTrailPathComponent =
  | IResponseHeaders
  | IResponseBody
  | IQueryString
  | IUrl
  | IRequestBody
  | IRequestHeaders
  | IMethod
  | IResponseStatusCode;

interface IResponseHeaders {
  ResponseHeaders: {
    headerName: string;
  };
}

interface IResponseBody {
  ResponseBody: {
    contentType: string;
    statusCode: number;
  };
}

interface IQueryString {
  QueryString: {
    queryString: string;
  };
}

interface IUrl {
  Url: {};
}

interface IRequestBody {
  RequestBody: {
    contentType: string;
  };
}

interface IRequestHeaders {
  RequestHeaders: {
    headerName: string;
  };
}

interface IMethod {
  Method: {
    method: string;
  };
}

interface IResponseStatusCode {
  ResponseStatusCode: {
    statusCode: number;
  };
}
