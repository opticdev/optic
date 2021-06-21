import { ChangelogCategory } from '<src>/hooks/useEndpointsChangelog';

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
}

export interface IEndpointWithChanges extends IEndpoint {
  changes: ChangelogCategory | null;
}
