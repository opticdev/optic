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
export enum ICoreShapeInnerParameterNames {
  ListInner = '$listItem',
  NullableInner = '$nullableInner',
  OptionalInner = '$optionalInner',
}

// Diff Types the UI Handles

export const allowedDiffTypes: {
  [key: string]: {
    isBodyShapeDiff: boolean;
    inRequest: boolean;
    inResponse: boolean;
    unmatchedUrl: boolean;
    asString: string;
  };
} = {
  UnmatchedRequestUrl: {
    isBodyShapeDiff: false,
    inRequest: false,
    inResponse: false,
    unmatchedUrl: true,
    asString: 'UnmatchedRequestUrl',
  },
  UnmatchedRequestMethod: {
    isBodyShapeDiff: false,
    inRequest: false,
    inResponse: false,
    unmatchedUrl: true,
    asString: 'UnmatchedRequestMethod',
  },
  UnmatchedRequestBodyContentType: {
    isBodyShapeDiff: false,
    inRequest: true,
    inResponse: false,
    unmatchedUrl: false,
    asString: 'UnmatchedRequestBodyContentType',
  },
  UnmatchedResponseBodyContentType: {
    isBodyShapeDiff: false,
    inRequest: false,
    inResponse: true,
    unmatchedUrl: false,
    asString: 'UnmatchedResponseBodyContentType',
  },
  UnmatchedResponseStatusCode: {
    isBodyShapeDiff: false,
    inRequest: false,
    inResponse: true,
    unmatchedUrl: false,
    asString: 'UnmatchedResponseStatusCode',
  },
  UnmatchedRequestBodyShape: {
    isBodyShapeDiff: true,
    inRequest: true,
    inResponse: false,
    unmatchedUrl: false,
    asString: 'UnmatchedRequestBodyShape',
  },
  UnmatchedResponseBodyShape: {
    isBodyShapeDiff: true,
    inRequest: false,
    inResponse: true,
    unmatchedUrl: false,
    asString: 'UnmatchedResponseBodyShape',
  },
};

export const allowedDiffTypesKeys: string[] = Object.keys(allowedDiffTypes);

// Properties of Each Diff Types

export const isBodyShapeDiff = (key: string): boolean =>
  allowedDiffTypes[key]?.isBodyShapeDiff;
export const isDiffForKnownEndpoint = (key: string): boolean =>
  !allowedDiffTypes[key]?.unmatchedUrl;
export const DiffInRequest = (key: string): boolean =>
  allowedDiffTypes[key]?.inRequest;
export const DiffInResponse = (key: string): boolean =>
  allowedDiffTypes[key]?.inResponse;

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

///////////////////////////////////////
export interface IToDocument {
  method: string;
  count: number;
  pathExpression: string;
}
