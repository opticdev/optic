import React from 'react';
import { useParams, useRouteMatch, matchPath } from 'react-router-dom';
import { ApiSpecServiceLoader } from '../components/loaders/ApiLoader';
import {
  Provider as DebugSessionContextProvider,
  useMockSession,
} from '../contexts/MockDataContext';
import { ApiRoutes } from '../routes';
import { Provider as BaseUrlContext } from '../contexts/BaseUrlContext';
import {
  ExampleCaptureService,
  ExampleDiffService,
} from '../services/diff/ExampleDiffService';

export default function TestingSessions(props) {
  const match = useRouteMatch();
  const { sessionId } = useParams();

  const session = useMockSession({
    sessionId: sessionId,
    exampleSessionCollection: 'example-sessions',
  });

  const captureServiceFactory = (specService, captureId) => {
    return new ExampleCaptureService(specService, captureId);
  };

  const diffServiceFactory = (specService, additionalCommands, config) => {
    return new ExampleDiffService(specService, additionalCommands, config);
  };

  return (
    <BaseUrlContext value={{ path: match.path, url: match.url }}>
      <DebugSessionContextProvider value={session}>
        <ApiSpecServiceLoader
          captureServiceFactory={captureServiceFactory}
          diffServiceFactory={diffServiceFactory}
        >
          <ApiRoutes />
        </ApiSpecServiceLoader>
      </DebugSessionContextProvider>
    </BaseUrlContext>
  );
}
