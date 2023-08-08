import { ResultWithSourcemap } from './types';
import { IChange } from './openapi3/sdk/types';

export type CompareFileJson = {
  results: ResultWithSourcemap[];
  changes: IChange[];
  // TODO remove this on 2022 Aug
  projectRootDir?: string | false;
  version?: string;
};
