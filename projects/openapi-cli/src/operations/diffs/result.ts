import { JsonPath } from '@useoptic/openapi-io';
import { OpenAPIV3 } from '../../specs';
import { SchemaObject } from '../../shapes';

export enum OperationDiffResultKind {
  MatchedRequestBody = 'MatchedRequestBody',
  MatchedResponseBody = 'MatchedRequestBody',
  UnmatchedRequestBody = 'UnmatchedRequestBody',
  UnmatchedResponseBody = 'UnmatchedRequestBody',
}

export type OperationDiffResult = {} & (
  | {
      kind: OperationDiffResultKind.MatchedRequestBody;
      schema: SchemaObject;
      contentType: string;
      specPath: string;
    }
  | {
      kind: OperationDiffResultKind.MatchedResponseBody;
      schema: SchemaObject;
      contentType: string;
      statusCode: number;
      specPath: string;
    }
  | {
      kind: OperationDiffResultKind.UnmatchedRequestBody;
      contentType: string;
    }
  | {
      kind: OperationDiffResultKind.UnmatchedResponseBody;
      contentType: string;
      statusCode: number;
    }
);
