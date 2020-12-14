import React, { useEffect, useState } from 'react';
import { JsonHttpClient } from '@useoptic/client-utilities';
import niceTry from 'nice-try';
const notificationsUrl = '/api/tracking/events';
const statusUrl = '/api/daemon/status';

export function useUserTracking() {
  const [events, setEvents] = useState([]);
  const [daemonIsUp, setDaemonIsUp] = useState(true);
  const [_, setNotificationChannel] = useState(null);

  useEffect(() => {
    if (!daemonIsUp) {
      return setNotificationChannel(null);
    }
    const notificationChannel = new EventSource(notificationsUrl);
    setNotificationChannel(notificationChannel);
    notificationChannel.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === 'message' && data) {
        setEvents((e) => [...e, data]);
      } else if (type === 'error') {
      }
    };
    notificationChannel.onerror = (e) => {
      console.error(e);
    };
    notificationChannel.onopen = (e) => {
      console.log(e);
    };

    return () => notificationChannel.close();
  }, [daemonIsUp]);

  return { events, daemonIsUp };
}

export function useLatestEvent(block, events) {
  useEffect(() => {
    const lastEvent = events[events.length - 1];
    if (lastEvent) {
      block(lastEvent);
    }
  }, [events.length]);
}
