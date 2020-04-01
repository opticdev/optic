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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!debugSession) {
      setData(null);
      setLoading(false);
    } else {
      getData()
        .then((result) => {
          setData(result);
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
        });
    }
  }, deps);

  return { data, loading, error };
}
