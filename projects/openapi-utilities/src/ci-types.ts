import { ResultWithSourcemap } from './types';
import { IChange } from './openapi3/sdk/types';

export type CompareFileJson = {
  results: ResultWithSourcemap[];
  changes: IChange[];
  projectRootDir?: string | false;
  version?: string;
};
