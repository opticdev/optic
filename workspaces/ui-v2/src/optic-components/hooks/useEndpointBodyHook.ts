import * as React from 'react';
import { useContext } from 'react';

export function useEndpointBody(
  pathId: string,
  method: string,
  renderChangesSince?: string
): { requests: IRequestBody[]; responses: IResponseBody[] } {
  //@TODO


  const requests: IRequestBody[] = []
  const responses: IResponseBody[] = []

  return { requests, responses };
}

export interface IRequestBody {
  requestId: string;
  contentType?: string;
  rootShapeId?: string;
  changelog?: {
    added: boolean;
    removed: boolean;
    changed: boolean;
  };
}

export interface IResponseBody {
  responseId: string;
  statusCode: string;
  contentType: string;
  rootShapeId?: string;
  changelog?: {
    added: boolean;
    removed: boolean;
    changed: boolean;
  };
}
