import { TrackingEventBase } from './TrackingEventBase';

export function RegisterEvent<T>(
  type: string,
  propsToSentence: (propsInstance: T) => string
): RegisteredEvent<T> {
  const event = {
    withProps(properties: T): TrackingEventBase<T> {
      return {
        type: type,
        context: {
          clientAgent: '',
          clientId: '',
          clientSessionInstanceId: '',
          clientTimestamp: '',
        },
        data: properties,
      };
    },
    toSentence: (example: TrackingEventBase<T>): string => {
      return propsToSentence(example.data);
    },
    eventName: type,
  };

  AllEvents.push(event);

  return event;
}

export const AllEvents: RegisteredEvent<any>[] = [];

export interface RegisteredEvent<T> {
  eventName: string;
  withProps(properties: T): TrackingEventBase<T>;
  toSentence(example: TrackingEventBase<T>): string;
}
