export interface TrackingEventBase<T> {
    type: string;
    data: T;
    context: ClientContext;
}
export interface ClientContext {
    clientId: string;
    clientSessionInstanceId: string;
    clientTimestamp: string;
    clientAgent: string;
}
