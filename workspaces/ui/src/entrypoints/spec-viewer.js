import React from 'react';
import { useParams, useRouteMatch, matchPath } from 'react-router-dom';
import { ApiSpecServiceLoader } from '../components/loaders/ApiLoader';
import { useSpecSession } from '../contexts/SpecViewerContext';
import { Provider as DebugSessionContextProvider } from '../contexts/MockDataContext';
import { ApiRoutes } from '../routes';
import { Provider as BaseUrlContext } from '../contexts/BaseUrlContext';

export default function SpecViewer(props) {
  const match = useRouteMatch();
  const { specId } = useParams();

  const session = useSpecSession(specId);

  return (
    <BaseUrlContext value={{ path: match.path, url: match.url }}>
      <DebugSessionContextProvider value={session}>
        <ApiSpecServiceLoader>
          <ApiRoutes defaultRoute={(options) => options.docsRoot} />
        </ApiSpecServiceLoader>
      </DebugSessionContextProvider>
    </BaseUrlContext>
  );
}
