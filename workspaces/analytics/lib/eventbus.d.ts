import { ClientContext, TrackingEventBase } from './interfaces/TrackingEventBase';
export declare function newAnalyticsEventBus(getContext: () => ClientContext): {
    emit: (event: TrackingEventBase<any>) => void;
    listen: (callback: (e: TrackingEventBase<any>) => void) => void;
};
