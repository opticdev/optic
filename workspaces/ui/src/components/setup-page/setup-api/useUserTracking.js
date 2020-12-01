import React, { useEffect, useState } from 'react';
import { JsonHttpClient } from '@useoptic/client-utilities';
import niceTry from 'nice-try';
const notificationsUrl = 'http://localhost:34444/api/tracking/events';
const statusUrl = 'http://localhost:34444/api/daemon/status';

export function useUserTracking() {
  const [events, setEvents] = useState([]);
  const [daemonIsUp, setDaemonIsUp] = useState(null);
  const [_, setNotificationChannel] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      niceTry(async () => {
        JsonHttpClient.getJson(statusUrl)
          .then((i) => {
            if (i.isRunning) return setDaemonIsUp(true);
            else {
              setDaemonIsUp(false);
            }
          })
          .catch(() => setDaemonIsUp(false));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [daemonIsUp]);

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
