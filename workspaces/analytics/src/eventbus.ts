import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

import {
  CliClientContext,
  TrackingEventBase,
} from './interfaces/TrackingEventBase';

export function newAnalyticsEventBus(
  getContext: (batchId: string) => Promise<CliClientContext>
): AnalyticsEventBus {
  const eventEmitter = new EventEmitter();
  return {
    emit: async (...events: TrackingEventBase<any>[]) => {
      const batchId = uuidv4();
      const context = await getContext(batchId);
      events.forEach((event) => {
        eventEmitter.emit('event', { event, context });
      });
    },
    eventEmitter,
    listen: (callback: ListenCallbackType): void => {
      eventEmitter.on('event', callback);
    },
  };
}

type ListenCallbackType = (e: {
  event: TrackingEventBase<any>;
  context: CliClientContext;
}) => void;

export interface AnalyticsEventBus {
  eventEmitter: EventEmitter;
  emit: (...events: TrackingEventBase<any>[]) => void;
  listen: (callback: ListenCallbackType) => void;
}
