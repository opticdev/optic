export type IRequestSpecTrail =
  | ISpecPath
  | ISpecRequestBody
  | ISpecRequestRoot
  | ISpecResponseBody
  | ISpecResponseRoot;

export const RequestTrailConstants: {
  SpecRequestRoot: string;
  SpecRoot: string;
  SpecResponseRoot: string;
  SpecRequestBody: string;
  SpecPath: string;
  SpecResponseBody: string;
} = {
  SpecResponseBody: 'SpecResponseBody',
  SpecRequestRoot: 'SpecRequestRoot',
  SpecPath: 'SpecPath',
  SpecRequestBody: 'SpecRequestBody',
  SpecResponseRoot: 'SpecResponseRoot',
  SpecRoot: 'SpecRoot',
};

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
