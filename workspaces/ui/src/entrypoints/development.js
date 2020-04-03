import React from 'react';
import {Route, Switch, useParams} from 'react-router-dom';
import ApiSpecServiceLoader from '../components/loaders/ApiLoader';
import {Provider as DebugSessionContextProvider, useMockSession} from '../contexts/MockDataContext';
import {ApiRoutes} from '../routes';

export default function Development(props) {

  const {match} = props;
  const {sessionId} = useParams();

  const debugSession = useMockSession({
    sessionId: sessionId,
    path: match.url
  });

  return (
    <DebugSessionContextProvider value={debugSession}>
      <ApiSpecServiceLoader>
        <ApiRoutes />
      </ApiSpecServiceLoader>
    </DebugSessionContextProvider>
  );

}
