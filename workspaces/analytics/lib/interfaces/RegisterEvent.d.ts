import { TrackingEventBase } from './TrackingEventBase';
export declare function RegisterEvent<T>(type: string, propsToSentence: (propsInstance: T) => string): RegisteredEvent<T>;
export declare const AllEvents: RegisteredEvent<any>[];
export interface RegisteredEvent<T> {
    eventName: string;
    withProps(properties: T): TrackingEventBase<T>;
    toSentence(example: TrackingEventBase<T>): string;
}
