//@ts-ignore
import keymirror from 'keymirror';

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
} = keymirror({
  SpecResponseBody: null,
  SpecRequestRoot: null,
  SpecPath: null,
  SpecRequestBody: null,
  SpecResponseRoot: null,
  SpecRoot: null,
});

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
