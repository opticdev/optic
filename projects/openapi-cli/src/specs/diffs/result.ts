export enum SpecDiffResultKind {
  UnmatchedPath = 'UnmatchedPath',
  UnmatchedMethod = 'UnmatchedMethod',
}

export type SpecDiffResult = {} & (
  | {
      kind: SpecDiffResultKind.UnmatchedPath;
    }
  | {
      kind: SpecDiffResultKind.UnmatchedMethod;
      pathPattern: string;
    }
);
