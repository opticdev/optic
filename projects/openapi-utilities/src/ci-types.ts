import { IChange, OpenApiFact } from './openapi3/sdk/types';

export type CompareFileJson = {
  results: any[]; // TODO change type
  changes: IChange<OpenApiFact>[];
};

export type UploadFileJson = {
  opticWebUrl: string;
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
};
