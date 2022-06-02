import { IChange, ResultWithSourcemap } from '@useoptic/openapi-utilities';

export type ComparisonData = {
  changes: IChange[];
  results: ResultWithSourcemap[];
  version: string;
};

export type Comparison = {
  id: string;
  fromFileName?: string;
  toFileName?: string;
  context: any;
} & (
  | { loading: true }
  | { loading: false; error: true; errorDetails: any }
  | {
      loading: false;
      error: false;
      data: ComparisonData;
    }
);
