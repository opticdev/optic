import { JsonPath } from '@useoptic/openapi-io';
import { OpenAPIV3 } from '../../specs';
import { SchemaObject } from '../../shapes';

export enum OperationDiffResultKind {
  // Request Body
  MissingRequestBody = 'MissingRequestBody',
  UnmatchedRequestBody = 'UnmatchedRequestBody',

  // Response Body
  MissingResponseBody = 'MissingResponseBody',
  UnmatchedResponseStatusCode = 'UnmatchedResponseStatusCode',
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
      kind: OperationDiffResultKind.UnmatchedResponseStatusCode;
      statusCode: string;
    }
  | {
      kind: OperationDiffResultKind.UnmatchedResponseBody;
      contentType: string | null;
      statusCode: string;
    }
  | {
      kind: OperationDiffResultKind.MissingResponseBody;
      statusCode: string;
    }
);
