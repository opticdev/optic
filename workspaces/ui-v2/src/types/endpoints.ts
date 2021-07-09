import { ChangeType } from './changes';

export interface IPathParameter {
  id: string;
  name: string;
  isParameterized: boolean;
  description: string;
  endpointId: string;
}

export interface IPath {
  absolutePathPattern: string;
  parentPathId: string | null;
  absolutePathPatternWithParameterNames: string;
  isParameterized: boolean;
  name: string;
  pathId: string;
}

export interface IEndpoint {
  pathId: string;
  method: string;
  purpose: string;
  description: string;
  fullPath: string;
  pathParameters: IPathParameter[];
  isRemoved: boolean;
  query: IQueryParameters | null;
  requestBodies: IRequestBody[];
  responseBodies: IResponseBody[];
}

export interface IEndpointWithChanges extends IEndpoint {
  changes: ChangeType | null;
}

export interface IQueryParameters {
  queryParametersId: string;
  rootShapeId: string;
  isRemoved: boolean;
  description: string;
}

export interface IRequestBody {
  requestId: string;
  contentType: string;
  rootShapeId: string;
  pathId: string;
  method: string;
  description: string;
}

export interface IResponseBody {
  responseId: string;
  statusCode: number;
  contentType: string;
  rootShapeId: string;
  pathId: string;
  method: string;
  description: string;
}
