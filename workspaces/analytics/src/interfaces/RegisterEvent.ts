import { TrackingEventBase } from './TrackingEventBase';
import * as Joi from 'joi';
import 'joi-extract-type';

function RegisterEvent<T>(
  type: string,
  schema: any,
  propsToSentence: (propsInstance: T) => string
): RegisteredEvent<T> {
  const event = {
    withProps(properties: T): TrackingEventBase<T> {
      return {
        type: type,
        context: {
          apiName: '',
          clientAgent: '',
          clientId: '',
          platform: '',
          arch: '',
          release: '',
          clientSessionInstanceId: '',
          clientTimestamp: '',
          source: '',
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

export function DescribeEvent<A>(
  name: string,
  joiSchema: any,
  propsToSentence: (propsInstance: A) => string
): RegisteredEvent<A> {
  const event = RegisterEvent<A>(name, joiSchema, propsToSentence);
  return event;
}
