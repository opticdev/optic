//todo one time export from scala js, switch to types from Rust

import { IShapeTrail } from './shape-trail';
import { IInteractionTrail } from './interaction-trail';
import { IRequestSpecTrail } from './request-spec-trail';
import { IJsonTrail } from '@useoptic/cli-shared/build/diffs/json-trail';
import keymirror from 'keymirror';
// Top-level Diffs

export type IDiff =
  | IUnmatchedResponseBodyShape
  | IUnmatchedRequestBodyShape
  | IUnmatchedRequestUrl
  | IUnmatchedRequestMethod
  | IUnmatchedResponseBodyContentType
  | IUnmatchedRequestBodyContentType
  | IUnmatchedResponseStatusCode;

export const DiffTypes: {
  UnmatchedRequestUrl: string;
  UnmatchedRequestBodyShape: string;
  UnmatchedRequestMethod: string;
  UnmatchedResponseBodyShape: string;
  UnmatchedResponseBodyContentType: string;
  UnmatchedResponseStatusCode: string;
  UnmatchedRequestBodyContentType: string;
} = keymirror({
  UnmatchedResponseBodyShape: null,
  UnmatchedRequestBodyShape: null,
  UnmatchedRequestUrl: null,
  UnmatchedRequestMethod: null,
  UnmatchedResponseBodyContentType: null,
  UnmatchedRequestBodyContentType: null,
  UnmatchedResponseStatusCode: null,
});

export type IDiffWithShapeDiff =
  | IUnmatchedResponseBodyShape
  | IUnmatchedRequestBodyShape;

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
