import { machineIdSync } from 'node-machine-id';
import exitHook from 'async-exit-hook';

import { AbortSignal } from 'node-abort-controller';
import {
  flushEvents,
  trackEvent as _trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';

let id: string;
try {
  id = machineIdSync();
} catch (e) {
  id = 'unknown-user';
}

export { flushEvents };

export const trackEvent = (eventName: string, properties?: any) =>
  _trackEvent(eventName, id, properties);

export async function trackCompletion<S extends { [key: string]: any }>(
  eventName: string,
  initialStats: S,
  statsUpdates: () => AsyncIterable<S>,
  options: { abort?: AbortSignal } = {}
) {
  let stats = initialStats;
  let completed = false;

  function finish(callback?) {
    if (!callback) callback = () => {};
    if (!completed) {
      _trackEvent(`${eventName}.canceled`, id, stats);
    }

    flushEvents().then(callback, (err) => {
      console.warn('Could not flush usage analytics (non-critical)');
      callback();
    });
  }

  if (!options.abort) {
    // without abort control, register our own exit hook
    exitHook(finish);
  }

  for await (let newStats of statsUpdates()) {
    stats = newStats;
  }

  completed = true;

  _trackEvent(`${eventName}.completed`, id, stats);

  finish();
}
