import { IChange, OpenApiFact } from './openapi3/sdk/types';

export type NormalizedCiContext = {
  organization: string;
  pull_request: number;
  run: number;
  commit_hash: string;
  repo: string;
};

export type CompareFileJson = {
  results: any[]; // TODO change type
  changes: IChange<OpenApiFact>[];
};

export type UploadFileJson = {
  results: any[]; // TODO change type
  changes: IChange<OpenApiFact>[];
  opticWebUrl: string;
  ciContext: NormalizedCiContext;
};

export type BulkCompareFileJson = {
  comparisons: {
    results: any[]; // TODO change type
    changes: IChange<OpenApiFact>[];
    inputs: {
      from?: string;
      to?: string;
    };
  }[];
};

export type BulkUploadFileJson = {
  comparisons: {
    results: any[]; // TODO change type
    changes: IChange<OpenApiFact>[];
    inputs: {
      from?: string;
      to?: string;
    };
    opticWebUrl: string;
  }[];
  ciContext: NormalizedCiContext;
};
