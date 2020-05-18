export interface ITestingService {
  loadSpecEvents(captureId: CaptureId): Promise<Result<RfcEventStream>>;

  listCaptures(): Promise<Result<Capture[]>>;

  loadCapture(captureId: CaptureId): Promise<Result<Capture, NotFoundError>>;

  loadReport(
    captureId: CaptureId
  ): Promise<Result<CoverageReport, NotFoundError>>;

  loadEndpointDiffs(
    captureId: CaptureId,
    pathId: PathId,
    httpMethod: HttpMethod
  ): Promise<Result<any, NotFoundError>>;

  loadUndocumentedEndpoints(
    captureId: CaptureId
  ): Promise<Result<UndocumentedEndpoint[], NotFoundError>>;
}

export type CaptureId = string;
export type ISO8601Date = string;
export type StableHash = string;
export type PathId = string;
export type HttpMethod =
  | 'GET'
  | 'OPTIONS'
  | 'DELETE'
  | 'HEAD'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE';

export interface Capture {
  captureId: CaptureId;
  createdAt: ISO8601Date;
  updatedAt: ISO8601Date;
  completedAt: ISO8601Date | null;
  tags: Array<{ name: string; value: string }>;
}

export interface CoverageReport {
  coverageCounts: {
    // index signature parameter cannot be a type alias :(
    [stableHash: string]: number;
  };
  diffs: {
    // index signature parameter cannot be a type alias :(
    [stableHash: string]: number;
  };
}

export interface UndocumentedEndpoint {
  method: HttpMethod;
  path: string;
  pathId: PathId;
  count: number;
}

export interface RfcEvent {
  // TODO create types for all types of events
  [prop: string]: any;
  eventContext: null | {
    clientId: string;
    clientSessionId: string;
    clientCommandBatchId: string;
    createdAt: ISO8601Date;
  };
}

export type RfcEventStream = Array<{ [eventType: string]: RfcEvent }>;

const TESTING_SERVICE_ERROR_TYPE = Symbol('testing-service-error');
export class TestingServiceError extends Error {
  statusCode: number;
  type: Symbol = TESTING_SERVICE_ERROR_TYPE;

  static instanceOf(maybeErr) {
    return maybeErr && maybeErr.type === TESTING_SERVICE_ERROR_TYPE;
  }

  notFound() {
    return this.statusCode === 404;
  }
}

export class NotFoundError extends TestingServiceError {
  statusCode = 404;
}

interface IResult<T> {
  isOk(): boolean;
  isErr(): boolean;
  unwrap(): T;
}

export class Ok<T, E extends TestingServiceError = TestingServiceError>
  implements IResult<T> {
  constructor(readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true;
  }

  isErr(): this is Err<T, E> {
    return !this.isOk();
  }

  unwrap(): T {
    return this.value;
  }

  unwrapErr(): E {
    throw new Error('Cannot unwrap error on Ok');
  }
}

export class Err<T, E extends TestingServiceError = TestingServiceError>
  implements IResult<T> {
  constructor(readonly error: E) {}

  isOk(): this is Ok<T, E> {
    return !this.isErr();
  }

  isErr(): this is Err<T, E> {
    return true;
  }

  unwrap(): T {
    throw this.error;
  }

  unwrapErr(): E {
    return this.error;
  }
}

export type Result<T, E extends TestingServiceError = TestingServiceError> =
  | Ok<T, E>
  | Err<T, E>;

export function ok<T, E extends TestingServiceError = TestingServiceError>(
  value: T
): Ok<T, E> {
  return new Ok(value);
}

export function err<T, E extends TestingServiceError>(err: E): Err<T, E> {
  return new Err(err);
}
