import React from 'react';
import {
  useParams,
  useRouteMatch,
  matchPath,
  Switch,
  Redirect,
  Route,
} from 'react-router-dom';
import { ApiSpecServiceLoader } from '../components/loaders/ApiLoader';
import {
  Provider as DebugSessionContextProvider,
  useMockSession,
} from '../contexts/MockDataContext';
import { ApiRoutes } from '../routes';
import { Provider as BaseUrlContext } from '../contexts/BaseUrlContext';

export default function DemoSessions(props) {
  const match = useRouteMatch();
  const { sessionId } = useParams();
  const session = useMockSession({
    sessionId: sessionId,
    exampleSessionCollection: 'demos',
  });

  return (
    <BaseUrlContext value={{ path: match.path, url: match.url }}>
      <DebugSessionContextProvider value={session}>
        <ApiSpecServiceLoader>
          <ApiRoutes />
        </ApiSpecServiceLoader>
      </DebugSessionContextProvider>
    </BaseUrlContext>
  );
}

export function DemoTopLevelRoutes() {
  return (
    <Switch>
      <Route strict path="/demos/:sessionId" component={DemoSessions} />
      <Redirect to={'/demos/github/review/example-session'} />
    </Switch>
  );
}
