import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

import {
  ClientContext,
  TrackingEventBase,
} from './interfaces/TrackingEventBase';
import exp from 'constants';

export function newAnalyticsEventBus(
  getContext: (batchId: string) => Promise<ClientContext>
): AnalyticsEventBus {
  const eventEmitter = new EventEmitter();
  return {
    emit: async (...events: TrackingEventBase<any>[]) => {
      const batchId = uuidv4();
      const context = await getContext(batchId);
      events.forEach((event) => {
        eventEmitter.emit('event', { ...event, context });
      });
    },
    eventEmitter,
    listen: (callback: (e: TrackingEventBase<any>) => void): void => {
      eventEmitter.on('event', callback);
    },
  };
}

export interface AnalyticsEventBus {
  eventEmitter: EventEmitter;
  emit: (...events: TrackingEventBase<any>[]) => void;
  listen: (callback: (e: TrackingEventBase<any>) => void) => void;
}
