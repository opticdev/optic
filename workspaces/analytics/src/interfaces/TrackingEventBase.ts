export interface TrackingEventBase<T> {
  type: string;
  data: T;
}

export interface CliClientContext {
  clientId: string;
  platform: string;
  arch: string;
  release: string;
  apiName: string;
  clientSessionInstanceId: string;
  clientTimestamp: string;
  clientAgent: string;
  source: string;
}
