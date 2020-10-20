interface SerializedDiff {
  [key: string]: {
    interactionTrail: {
      path: any[];
    };
    requestsTrail: any;
  };
}

// Diff Types the UI Handles

export const allowedDiffTypes: {
  [key: string]: { isBodyShapeDiff: boolean };
} = {
  UnmatchedRequestUrl: { isBodyShapeDiff: false },
  UnmatchedRequestMethod: {
    isBodyShapeDiff: false,
  },
  UnmatchedRequestBodyContentType: {
    isBodyShapeDiff: false,
  },
  UnmatchedResponseBodyContentType: {
    isBodyShapeDiff: false,
  },
  UnmatchedResponseStatusCode: {
    isBodyShapeDiff: false,
  },
  UnmatchedRequestBodyShape: {
    isBodyShapeDiff: true,
  },
  UnmatchedResponseBodyShape: {
    isBodyShapeDiff: true,
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

export interface BodyShapeDiff<ShapeDiff, ShapeDiffLocation> {
  diff: ShapeDiff;
  type: string;
  interactionPointers: string[];
  location: IDiffLocation;
}

export type IDiffLocation = IRequestBodyLocation | IResponseBodyLocation;
export interface IRequestBodyLocation {
  contentType: string;
}

export interface IResponseBodyLocation {
  statusCode: number;
  contentType: string;
}
