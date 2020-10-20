export type IRequestSpecTrail =
  | ISpecPath
  | ISpecRequestBody
  | ISpecRequestRoot
  | ISpecResponseBody
  | ISpecResponseRoot;

export interface ISpecResponseBody {
  SpecResponseBody: {
    responseId: string;
  };
}

export interface ISpecRequestRoot {
  SpecRequestRoot: {
    requestId: string;
  };
}

export interface ISpecPath {
  SpecPath: {
    pathId: string;
  };
}

export interface ISpecRequestBody {
  SpecRequestBody: {
    requestId: string;
  };
}

export interface ISpecResponseRoot {
  SpecResponseRoot: {
    responseId: string;
  };
}

export interface ISpecRoot {
  SpecRoot: {};
}
