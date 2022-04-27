import { JsonPath } from '@useoptic/openapi-io';
import { OpenAPIV3 } from '../../specs';

export enum OperationDiffResultKind {
  Matched = 'Matched',
  MatchedRequestBody = 'MatchedRequestBody',
  MatchedResponseBody = 'MatchedRequestBody',
  UnmatchedPath = 'UnmatchedPath',
  UnmatchedMethod = 'UnmatchedMethod',
  UnmatchedRequestBody = 'UnmatchedRequestBody',
  UnmatchedResponseBody = 'UnmatchedRequestBody',
}

export type OperationDiffResult = {} & (
  | {
      kind: OperationDiffResultKind.Matched;
      operationPath: JsonPath;
      path: string;
      method: OpenAPIV3.HttpMethods;
    }
  | {
      kind: OperationDiffResultKind.UnmatchedPath;
    }
  | {
      kind: OperationDiffResultKind.UnmatchedMethod;
      matchedPath;
    }
);
