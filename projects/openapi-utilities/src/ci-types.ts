import { ResultWithSourcemap } from './types';
import { IChange, OpenApiFact } from './openapi3/sdk/types';

export type CompareFileJson = {
  results: ResultWithSourcemap[];
  changes: IChange<OpenApiFact>[];
  projectRootDir?: string | false;
  version?: string;
};
