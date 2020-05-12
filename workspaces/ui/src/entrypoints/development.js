import React from 'react';
import {useParams, useRouteMatch} from 'react-router-dom';
import {ApiSpecServiceLoader} from '../components/loaders/ApiLoader';
import {Provider as DebugSessionContextProvider, useMockSession} from '../contexts/MockDataContext';
import {ApiRoutes} from '../routes';
import {Provider as BaseUrlContext} from '../contexts/BaseUrlContext';

export default function Development(props) {

  const match = useRouteMatch();
  const {sessionId} = useParams();

  const debugSession = useMockSession({
    sessionId: sessionId,
  });

  return (
    <BaseUrlContext value={{path: match.path, url: match.url}}>
      <DebugSessionContextProvider value={debugSession}>
        <ApiSpecServiceLoader>
          <ApiRoutes/>
        </ApiSpecServiceLoader>
      </DebugSessionContextProvider>
    </BaseUrlContext>
  );

}
