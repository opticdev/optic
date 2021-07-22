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
  id: string;
  pathId: string;
  method: string;
  purpose: string;
  description: string;
  fullPath: string;
  pathParameters: IPathParameter[];
  isRemoved: boolean;
  query: IQueryParameters | null;
  requests: IRequest[];
  // Grouped by status code
  responsesByStatusCode: Record<number, IResponse[]>;
}

export interface IEndpointWithChanges extends IEndpoint {
  changes: ChangeType | null;
}

export interface IQueryParameters {
  queryParametersId: string;
  rootShapeId: string;
  isRemoved: boolean;
  description: string;
  endpointId: string;
  pathId: string;
  method: string;
}

export interface IRequest {
  requestId: string;
  description: string;
  endpointId: string;
  pathId: string;
  method: string;
  body: IBody | null;
}

export interface IResponse {
  responseId: string;
  statusCode: number;
  endpointId: string;
  pathId: string;
  method: string;
  description: string;
  body: IBody | null;
}

export interface IBody {
  contentType: string;
  rootShapeId: string;
}
