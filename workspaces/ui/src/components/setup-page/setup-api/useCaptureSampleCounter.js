import React, { useEffect, useRef, useState } from 'react';
import { JsonHttpClient } from '@useoptic/client-utilities';
import niceTry from 'nice-try';

const sessionsUrl = 'http://localhost:34444/api/sessions';
const samplesCount = (id, captureId) =>
  `http://localhost:34444/api/specs/${id}/captures/${captureId}/samples`;
const diffReviewUrlBuilder = (id) => `http://localhost:34444/apis/${id}/diffs`;

export function useCaptureSampleCounter(cwd, captureId) {
  const [count, setCount] = useState(0);
  const [diffReviewUrl, setDiffReviewUrl] = useState(null);

  useRecursiveTimeout(async () => {
    try {
      const { sessions } = await JsonHttpClient.getJson(sessionsUrl);

      const normalized = (() => {
        if (sessions && Array.isArray(sessions)) {
          return sessions
        } else {
          return sessions.sessions
        }
      })()

      const thisAPISession = normalized.find((i) => i.path === cwd);
      if (thisAPISession) {
        const localSessionId = thisAPISession.id;
        console.log('get count', samplesCount(localSessionId, captureId));
        const { samples } = await JsonHttpClient.getJson(
          samplesCount(localSessionId, captureId)
        );
        setCount(samples.length);
        setDiffReviewUrl(diffReviewUrlBuilder(localSessionId));
      }
    } catch (e) {
      console.error(e);
    }
  }, 1500);

  return { count, diffReviewUrl };
}

function useRecursiveTimeout(callback, delay) {
  const savedCallback = useRef(callback);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout loop.
  useEffect(() => {
    let id;
    function tick() {
      const ret = savedCallback.current();
      if (ret instanceof Promise) {
        ret.then(() => {
          if (delay !== null) {
            id = setTimeout(tick, delay);
          }
        });
      } else {
        if (delay !== null) {
          id = setTimeout(tick, delay);
        }
      }
    }
    if (delay !== null) {
      id = setTimeout(tick, delay);
      return () => id && clearTimeout(id);
    }
  }, [delay]);
}
