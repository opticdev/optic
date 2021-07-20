export type IRequestSpecTrail =
  | ISpecRoot
  | ISpecPath
  | ISpecRequestBody
  | ISpecRequestRoot
  | ISpecResponseBody
  | ISpecResponseRoot
  | ISpecQueryParameters;

interface ISpecQueryParameters {
  SpecQueryParameters: {
    queryParametersId: string;
  };
}

interface ISpecResponseBody {
  SpecResponseBody: {
    responseId: string;
  };
}

interface ISpecRequestRoot {
  SpecRequestRoot: {
    requestId: string;
  };
}

interface ISpecPath {
  SpecPath: {
    pathId: string;
  };
}

interface ISpecRequestBody {
  SpecRequestBody: {
    requestId: string;
  };
}

interface ISpecResponseRoot {
  SpecResponseRoot: {
    responseId: string;
  };
}

interface ISpecRoot {
  SpecRoot: {};
}
