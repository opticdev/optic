export interface ITestingService {
  loadSpecEvents(
    captureId: CaptureId
  ): Promise<Array<{ [eventType: string]: RfcEvent }>>;

  listCaptures(): Promise<Capture[]>;

  loadCapture(captureId: CaptureId): Promise<Capture>;

  loadReport(captureId: CaptureId): Promise<CoverageReport>;

  loadEndpointDiffs(
    captureId: CaptureId,
    pathId: PathId,
    httpMethod: HttpMethod
  );

  loadUndocumentedEndpoints(
    captureId: CaptureId
  ): Promise<UndocumentedEndpoint[]>;
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

export class TestingServiceError extends Error {
  statusCode: number;
  type: string;

  static type = 'testing-service-error';
  // don't rely on `instanceof` in JS, it's a mistake
  static instanceOf(maybeErr) {
    return maybeErr && maybeErr.type === TestingServiceError.type;
  }

  constructor(msg, { statusCode }) {
    super(msg);
    this.statusCode = statusCode;
    this.type = TestingServiceError.type;
  }

  notFound() {
    return this.statusCode === 404;
  }
}
