import { JsonPath } from '@useoptic/openapi-io';
import { OpenAPIV3 } from '../../specs';
import { SchemaObject } from '../../shapes';

export enum OperationDiffResultKind {
  UnmatchedRequestBody = 'UnmatchedRequestBody',
  MissingRequestBody = 'MissingRequestBody',
  UnmatchedResponseBody = 'UnmatchdResponseBody',
}

export type OperationDiffResult = {} & (
  | {
      kind: OperationDiffResultKind.UnmatchedRequestBody;
      contentType: string | null;
    }
  | {
      kind: OperationDiffResultKind.MissingRequestBody;
    }
  | {
      kind: OperationDiffResultKind.UnmatchedResponseBody;
      contentType: string | null;
      statusCode: number;
    }
);
