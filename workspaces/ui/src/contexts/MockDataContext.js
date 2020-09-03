import React, { useContext, useEffect, useMemo, useState } from 'react';

const MockDataContext = React.createContext(null);
MockDataContext.displayName = 'MockDataContext';

// only expose the Provider component, but hide the Consumer in favour of hooks
export const { Provider } = MockDataContext;

function createDebugSession({ exampleSessionCollection, sessionId }) {
  let fetchedData = null;
  async function getData(refresh = false) {
    if (!fetchedData || refresh) {
      // only fetch data once
      fetchedData = fetch(`/${exampleSessionCollection}/${sessionId}.json`, {
        headers: { accept: 'application/json' },
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
    getData,
  };
}


// Hooks
// -----

export function useMockSession({ sessionId, exampleSessionCollection }) {
  const dashboardContext = useMemo(
    () => createDebugSession({ sessionId, exampleSessionCollection }),
    [sessionId]
  );
  return dashboardContext;
}

export function useMockData(deps, context=MockDataContext) {
  const debugSession = useContext(MockDataContext);
  // TODO: consider using useReducer here instead, lots of moving bits of state here
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [available, setAvailable] = useState(true);

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
          console.log("no data err")
          console.log(err)
          setError(err);
        });
    }
  }, deps);

  return { available, data, loading, error };
}
