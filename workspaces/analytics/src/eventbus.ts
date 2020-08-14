import { EventEmitter } from 'events';
import {
  ClientContext,
  TrackingEventBase,
} from './interfaces/TrackingEventBase';

export function newAnalyticsEventBus(getContext: () => ClientContext) {
  const eventEmitter = new EventEmitter();
  return {
    emit: (event: TrackingEventBase<any>) => {
      eventEmitter.emit('event', { ...event, context: getContext() });
    },
    listen: (callback: (e: TrackingEventBase<any>) => void): void => {
      eventEmitter.on('event', callback);
    },
  };
}
