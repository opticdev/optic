import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export enum OperationDiffResultKind {
  // Operation
  UnmatchedPath = 'UnmatchedPath',
  UnmatchedPathParameter = 'UnmatchedPathParameter',
  UnmatchedMethod = 'UnmatchedMethod',

  // Request Body
  MissingRequestBody = 'MissingRequestBody',
  UnmatchedRequestBody = 'UnmatchedRequestBody',
  MissingRequestParametersArray = 'MissingRequestParametersArray',
  UnmatchedRequestParameter = 'UnmatchedRequestParameter',
  MissingRequiredRequiredParameter = 'MissingRequiredRequiredParameter',

  // Response Body
  MissingResponseBody = 'MissingResponseBody',
  UnmatchedResponseStatusCode = 'UnmatchedResponseStatusCode',
  UnmatchedResponseBody = 'UnmatchdResponseBody',
  MissingResponseHeadersObject = 'MissingResponseHeadersObject',
  UnmatchedResponseHeader = 'UnmatchedResponseHeader',
  MissingRequiredResponseHeader = 'MissingRequiredResponseHeader',
}

export type OperationDiffResult =
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
  | { kind: OperationDiffResultKind.MissingRequestParametersArray }
  | {
      kind: OperationDiffResultKind.UnmatchedRequestParameter;
      name: string;
      in: 'header' | 'query';
    }
  | {
      kind: OperationDiffResultKind.MissingRequiredRequiredParameter;
      name: string;
      in: 'header' | 'query';
    }
  | {
      kind: OperationDiffResultKind.MissingResponseHeadersObject;
      statusCode: string;
    }
  | {
      kind: OperationDiffResultKind.UnmatchedResponseHeader;
      statusCode: string;
      name: string;
    }
  | {
      kind: OperationDiffResultKind.MissingRequiredResponseHeader;
      statusCode: string;
      name: string;
    };
