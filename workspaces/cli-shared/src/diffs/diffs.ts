//todo one time export from scala js, switch to types from Rust

import { IShapeTrail } from './shape-trail';
import { IInteractionTrail } from './interaction-trail';
import { IRequestSpecTrail } from './request-spec-trail';
import { IJsonTrail } from './json-trail';
// Top-level Diffs

export type IDiff =
  | IUnmatchedQueryParametersShape
  | IUnmatchedResponseBodyShape
  | IUnmatchedRequestBodyShape
  | IUnmatchedRequestUrl
  | IUnmatchedRequestMethod
  | IUnmatchedQueryParameters
  | IUnmatchedResponseBodyContentType
  | IUnmatchedRequestBodyContentType
  | IUnmatchedResponseStatusCode;

export const DiffTypes = {
  UnmatchedQueryParametersShape: 'UnmatchedQueryParametersShape',
  UnmatchedResponseBodyShape: 'UnmatchedResponseBodyShape',
  UnmatchedRequestBodyShape: 'UnmatchedRequestBodyShape',
  UnmatchedRequestUrl: 'UnmatchedRequestUrl',
  UnmatchedRequestMethod: 'UnmatchedRequestMethod',
  UnmatchedQueryParameters: 'UnmatchedQueryParameters',
  UnmatchedResponseBodyContentType: 'UnmatchedResponseBodyContentType',
  UnmatchedRequestBodyContentType: 'UnmatchedRequestBodyContentType',
  UnmatchedResponseStatusCode: 'UnmatchedResponseStatusCode',
};

export type IDiffWithShapeDiff =
  | IUnmatchedQueryParametersShape
  | IUnmatchedResponseBodyShape
  | IUnmatchedRequestBodyShape;

export interface IUnmatchedQueryParametersShape {
  UnmatchedQueryParametersShape: {
    interactionTrail: IInteractionTrail;
    requestsTrail: IRequestSpecTrail;
    shapeDiffResult: IShapeDiffResult;
  };
}

export interface IUnmatchedResponseBodyShape {
  UnmatchedResponseBodyShape: {
    interactionTrail: IInteractionTrail;
    requestsTrail: IRequestSpecTrail;
    shapeDiffResult: IShapeDiffResult;
  };
}

export interface IUnmatchedRequestUrl {
  UnmatchedRequestUrl: {
    interactionTrail: IInteractionTrail;
    requestsTrail: IRequestSpecTrail;
  };
}

export interface IUnmatchedRequestMethod {
  UnmatchedRequestMethod: {
    interactionTrail: IInteractionTrail;
    requestsTrail: IRequestSpecTrail;
  };
}

export interface IUnmatchedResponseBodyContentType {
  UnmatchedResponseBodyContentType: {
    interactionTrail: IInteractionTrail;
    requestsTrail: IRequestSpecTrail;
  };
}

export interface IUnmatchedQueryParameters {
  UnmatchedQueryParameters: {
    interactionTrail: IInteractionTrail;
    requestsTrail: IRequestSpecTrail;
  };
}

export interface IUnmatchedRequestBodyContentType {
  UnmatchedRequestBodyContentType: {
    interactionTrail: IInteractionTrail;
    requestsTrail: IRequestSpecTrail;
  };
}

export interface IUnmatchedResponseStatusCode {
  UnmatchedResponseStatusCode: {
    interactionTrail: IInteractionTrail;
    requestsTrail: IRequestSpecTrail;
  };
}

export interface IUnmatchedRequestBodyShape {
  UnmatchedRequestBodyShape: {
    interactionTrail: IInteractionTrail;
    requestsTrail: IRequestSpecTrail;
    shapeDiffResult: IShapeDiffResult;
  };
}

// Shape Diffs

export type IShapeDiffResult = IUnmatchedShape | IUnspecifiedShape;
export interface IUnmatchedShape {
  UnmatchedShape: {
    jsonTrail: IJsonTrail;
    shapeTrail: IShapeTrail;
  };
}

export interface IUnspecifiedShape {
  UnspecifiedShape: {
    jsonTrail: IJsonTrail;
    shapeTrail: IShapeTrail;
  };
}

//////////////////////////////
