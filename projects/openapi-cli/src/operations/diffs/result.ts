import { OpenAPIV3 } from '../../specs';

export enum OperationDiffResultKind {
  // Operation
  UnmatchedPath = 'UnmatchedPath',
  UnmatchedPathParameter = 'UnmatchedPathParameter',
  UnmatchedMethod = 'UnmatchedMethod',

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
      kind: OperationDiffResultKind.UnmatchedPath;
      subject: string;
    }
  | {
      kind: OperationDiffResultKind.UnmatchedPathParameter;
      subject: string;
    }
  | {
      kind: OperationDiffResultKind.UnmatchedMethod;
      subject: OpenAPIV3.HttpMethods;
      pathPattern: string;
    }
  | {
      kind: OperationDiffResultKind.UnmatchedRequestBody;
      contentType: string | null;
    }
  | {
      kind: OperationDiffResultKind.MissingRequestBody;
    }
  | {
      kind: OperationDiffResultKind.UnmatchedResponseStatusCode;
      contentType: string | null;
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
