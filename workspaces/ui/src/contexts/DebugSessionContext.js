import React, { useContext, useEffect, useMemo, useState } from 'react';

const DebugSessionContext = React.createContext(null);
DebugSessionContext.displayName = 'DebugSessionContext';

// only expose the Provider component, but hide the Consumer in favour of hooks
export const { Provider } = DebugSessionContext;

function createDebugSession(sessionId) {
  let fetchedData = null;
  async function getData(refresh = false) {
    if (!fetchedData || refresh) {
      // only fetch data once
      fetchedData = fetch(`/example-sessions/${sessionId}.json`, {
        headers: { accept: 'application/json' }
      }).then((response) => {
        if (response.ok) {
          return response.json();
        }

        throw new Error();
      });
    }
    return await fetchedData;
  }

  return {
    sessionId,
    getData
  };
}

// Hooks
// -----

export function useDebugSession(sessionId) {
  const dashboardContext = useMemo(() => createDebugSession(sessionId), [
    sessionId
  ]);

  return dashboardContext;
}

export function useDebugData(deps) {
  const debugSession = useContext(DebugSessionContext);
  // TODO: consider using useReducer here instead, lots of moving bits of state here
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [available, setAvailable] = useState(!!debugSession);

  useEffect(() => {
    if (!debugSession) {
      setAvailable(false);
      setData(null);
      setLoading(false);
    } else {
      setAvailable(true);
      debugSession
        .getData()
        .then((result) => {
          setData(result);
          setLoading(false);
          return result;
        })
        .catch((err) => {
          setError(err);
        });
    }
  }, deps);

  return { available, data, loading, error };
}
