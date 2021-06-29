import { ChangelogCategory } from '<src>/hooks/useEndpointsChangelog';
import { IChanges } from '<src>/pages/changelog/IChanges';

export interface IPathParameter {
  id: string;
  name: string;
  isParameterized: boolean;
  description: string;
  endpointId: string;
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
  requestBody: IRequestBody | null;
  responseBodies: IResponseBody[];
}

export interface IEndpointWithChanges extends IEndpoint {
  changes: ChangelogCategory | null;
}

export interface IQueryParameters {
  rootShapeId: string;
  isRemoved: boolean;
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
