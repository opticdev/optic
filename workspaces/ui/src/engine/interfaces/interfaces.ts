import { IDiff } from './diffs';

interface SerializedDiff {
  [key: string]: {
    interactionTrail: {
      path: any[];
    };
    requestsTrail: any;
  };
}

export enum ICoreShapeKinds {
  ObjectKind = '$object',
  ListKind = '$list',
  MapKind = '$map',
  OneOfKind = '$oneOf',
  AnyKind = '$any',
  StringKind = '$string',
  NumberKind = '$number',
  BooleanKind = '$boolean',
  NullableKind = '$nullable',
  OptionalKind = '$optional',
  UnknownKind = '$unknown',
}

// Diff Types the UI Handles

export const allowedDiffTypes: {
  [key: string]: { isBodyShapeDiff: boolean; asString: string };
} = {
  UnmatchedRequestUrl: {
    isBodyShapeDiff: false,
    asString: 'UnmatchedRequestUrl',
  },
  UnmatchedRequestMethod: {
    isBodyShapeDiff: false,
    asString: 'UnmatchedRequestMethod',
  },
  UnmatchedRequestBodyContentType: {
    isBodyShapeDiff: false,
    asString: 'UnmatchedRequestBodyContentType',
  },
  UnmatchedResponseBodyContentType: {
    isBodyShapeDiff: false,
    asString: 'UnmatchedResponseBodyContentType',
  },
  UnmatchedResponseStatusCode: {
    isBodyShapeDiff: false,
    asString: 'UnmatchedResponseStatusCode',
  },
  UnmatchedRequestBodyShape: {
    isBodyShapeDiff: true,
    asString: 'UnmatchedRequestBodyShape',
  },
  UnmatchedResponseBodyShape: {
    isBodyShapeDiff: true,
    asString: 'UnmatchedResponseBodyShape',
  },
};

export const allowedDiffTypesKeys: string[] = Object.keys(allowedDiffTypes);

// Properties of Each Diff Types

export const isBodyShapeDiff = (key: string): boolean =>
  allowedDiffTypes[key]?.isBodyShapeDiff;
export const DiffInRequest = (key: string): boolean =>
  key === 'UnmatchedRequestBodyShape';
export const DiffInResponse = (key: string): boolean =>
  key === 'UnmatchedResponseBodyShape';

// The ones we like to work with in the UI

export interface IRequestBodyLocation {
  contentType?: string;
}

export interface IResponseBodyLocation {
  statusCode: number;
  contentType?: string;
}

export interface IParsedLocation {
  pathId: string;
  method: string;
  inRequest?: IRequestBodyLocation;
  inResponse?: IResponseBodyLocation;
}
