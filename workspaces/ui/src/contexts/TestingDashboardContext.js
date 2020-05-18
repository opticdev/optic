import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { TestingServiceError } from '../services/testing';

const TestingDashboardContext = React.createContext(null);

// only expose the Provider component, but hide the Consumer in favour of hooks
export const { Provider } = TestingDashboardContext;

// to make sure the actual shape of the context remains an implementation detail
// we're in control of here
export function createContext({ service, baseUrl }) {
  return { service, baseUrl };
}

export function useTestingService(
  performRequest, // Note: this is where a TS interface would give some nice safety
  deps = []
) {
  const { service } = useContext(TestingDashboardContext);

  const versionRef = useRef(1);
  const [state, dispatch] = useReducer(
    serviceStateReducer,
    initialServiceState(versionRef.current)
  );

  const isUnmounted = useRef(false);

  useEffect(() => {
    const effectVersion = versionRef.current;

    function effectDispatch(action) {
      return dispatch({
        ...action,
        version: effectVersion,
        latestVersion: versionRef.current,
      });
    }

    effectDispatch({ type: 'request' });
    performRequest(service).then((result) => {
      if (isUnmounted.current) return;
      if (result.isOk()) {
        effectDispatch({ type: 'receive_success', payload: result.value });
      } else {
        let err = result.unwrapErr();
        if (err.notFound()) {
          effectDispatch({ type: 'receive_not_found' });
        } else {
          effectDispatch({ type: 'receive_error', payload: err });
        }
      }
    });

    return () => {
      versionRef.current++;
    };
  }, deps);

  useEffect(() => {
    return () => {
      isUnmounted.current = true;
    };
  }, []);

  return state;
}

export function useReportPath(captureId) {
  const { baseUrl } = useContext(TestingDashboardContext);

  return `${baseUrl}/captures/${captureId}`;
}

export function useEndpointPath(captureId, endpointId) {
  const { baseUrl } = useContext(TestingDashboardContext);

  return `${baseUrl}/captures/${captureId}/endpoints/${endpointId}`;
}

export { queriesFromEvents } from '../services/testing/ExampleTestingService';

// Reducers
// --------

function initialServiceState() {
  return {
    loading: false,
    result: null,
    error: null,
    notFound: false,
  };
}

function serviceStateReducer(state, action) {
  if (action.version !== action.latestVersion) {
    return state;
  }

  switch (action.type) {
    case 'request': {
      return {
        ...initialServiceState(),
        loading: true,
      };
    }
    case 'receive_success': {
      if (!state.loading) return state;

      return {
        ...state,
        result: action.payload,
        loading: false,
      };
    }
    case 'receive_not_found': {
      if (!state.loading) return state;

      return {
        ...state,
        loading: false,
        result: null,
        notFound: true,
      };
    }
    case 'receive_error': {
      if (!state.loading) return state;

      return {
        ...state,
        loading: false,
        result: null,
        error: action.payload,
      };
    }
    default:
      throw new Error(
        `Unknown action type '${action.type}' for service state reducer`
      );
  }
}
