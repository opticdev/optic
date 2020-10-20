//todo one time export from scala js, switch to types from Rust

import { IShapeTrail } from './shape-trail';
import { IJsonTrail } from './json-trail';
import { IInteractionTrail } from './interaction-trail';
import { IRequestSpecTrail } from './request-spec-trail';

// Top-level Diffs

export type IDiff =
  | IUnmatchedResponseBodyShape
  | IUnmatchedRequestUrl
  | IUnmatchedRequestMethod
  | IUnmatchedResponseBodyContentType
  | IUnmatchedRequestBodyContentType
  | IUnmatchedResponseStatusCode;

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
