import React from 'react';
import {Route, Switch, useParams} from 'react-router-dom';
import {ApiSpecServiceLoader} from '../components/loaders/ApiLoader';
import {Provider as DebugSessionContextProvider, useMockSession} from '../contexts/MockDataContext';
import {ApiRoutes} from '../routes';
import {Provider as BaseUrlContext} from '../contexts/BaseUrlContext';

export default function Development(props) {

  const {match} = props;
  const {sessionId} = useParams();

  const debugSession = useMockSession({
    sessionId: sessionId,
  });

  return (
    <BaseUrlContext value={{path: match.url}}>
    <DebugSessionContextProvider value={debugSession}>
      <ApiSpecServiceLoader>
        <ApiRoutes />
      </ApiSpecServiceLoader>
    </DebugSessionContextProvider>
    </BaseUrlContext>
  );

}
