import { Severity } from './results';
import { IChange, IFact } from './openapi3/sdk/types';

export type LookupLineResult = {
  endLine: number;
  endPosition: number;
  startLine: number;
  startPosition: number;
};

export type LookupLineResultWithFilepath = LookupLineResult & {
  filePath: string;
};

export interface Result {
  where: string;
  error?: string;
  passed: boolean;
  exempted?: boolean;
  change: IChange | IFact; // IFact for `requirement`
  docsLink?: string;
  // new
  name?: string;
  expected?: string; // JSON string values
  received?: string; // JSON string values
  type?: 'requirement' | 'added' | 'changed' | 'removed';
  severity?: Severity;

  // to deprecate
  condition?: string;
  effectiveOnDate?: Date;
  isShould: boolean;
  isMust: boolean;
}

export type ResultWithSourcemap = Result & {
  sourcemap?: LookupLineResultWithFilepath;
};
