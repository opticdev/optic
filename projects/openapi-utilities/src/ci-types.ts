import { ResultWithSourcemap } from './types';
import { IChange } from './openapi3/sdk/types';

export type CompareFileJson = {
  results: ResultWithSourcemap[];
  changes: IChange[];
  // TODO remove this on 2022 Aug
  projectRootDir?: string | false;
  version?: string;
};

export type NormalizedCiContext = {
  organization: string;
  user: string | null;
  pull_request: number;
  run: number;
  commit_hash: string;
  repo: string;
  branch_name: string;
};

export type UploadJson = {
  opticWebUrl: string;
  ciContext: NormalizedCiContext;
};

export type BulkCompareJson = {
  comparisons: {
    results: ResultWithSourcemap[];
    changes: IChange[];
    projectRootDir?: string | false;
    version: string;
    inputs: {
      from?: string;
      to?: string;
    };
  }[];
};

export type BulkUploadJson = {
  comparisons: {
    results: ResultWithSourcemap[];
    changes: IChange[];
    inputs: {
      from?: string;
      to?: string;
    };
    opticWebUrl: string;
  }[];
  ciContext: NormalizedCiContext;
};
