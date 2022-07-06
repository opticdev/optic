import { OpenAPIV3 } from '..';

export enum SpecDiffResultKind {
  UnmatchedPath = 'UnmatchedPath',
  UnmatchedMethod = 'UnmatchedMethod',
}

export type SpecDiffResult = {} & (
  | {
      kind: SpecDiffResultKind.UnmatchedPath;
      subject: string;
    }
  | {
      kind: SpecDiffResultKind.UnmatchedMethod;
      subject: OpenAPIV3.HttpMethods;
      pathPattern: string;
    }
);
