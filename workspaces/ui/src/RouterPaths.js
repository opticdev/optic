import { useDebugPath } from './contexts/DebugSessionContext';
import { join } from 'path';

// TODO: migrate away from various base paths. Everything is from root, unless prefixed
// through the debug context
export const basePaths = {
  exampleSessionsBasePath: '/example-sessions/:exampleId',
  exampleTestingDashboardBasePath: '/example-reports/:exampleId',
  interceptorBasePath: '/live-session',
  exampleDrivenSpecBasePath: '/spec-by-example',
  exampleCommandsBasePath: '/examples/:exampleId',
  sharedBasePath: '/shared/:sharedId',
  localBasePath: '/specs/:specId',
  localIntegrationsPath: '/specs/:specId/integrations/:integrationName'
};

// TODO: migrate away from routes as functions
export const routerPaths = {
  exampleCommandsRoot: () => basePaths.exampleCommandsBasePath,
  exampleSessionsRoot: () => basePaths.exampleSessionsBasePath,
  exampleDrivenRoot: () => basePaths.exampleDrivenSpecBasePath,
  sharedRoot: () => basePaths.sharedBasePath,
  interceptorRoot: () => basePaths.interceptorBasePath,
  localRoot: () => basePaths.localBasePath,
  request: (base = '') => `${base}/requests/:requestId`,
  pathMethod: (base = '') => `${base}/paths/:pathId/methods/:method`,
  init: (base = '') => `${base}/init`,
  apiDashboard: (base = '') => `${base}/dashboard`,
  apiDocumentation: (base = '') => `${base}/documentation`,
  integrationsDashboard: (base = '') => `${base}/integrations`,
  integrationsPath: (base = '') => `${base}/integrations/:integrationName`,
  diff: (base = '') => `${base}/diff/:sessionId`,
  diffUrls: (base = '') => `${base}/urls`,
  diffRequest: (base = '') => `${base}/requests/:requestId`,
  //@todo -- replace the old flow with this one
  diffRequestNew: (base = '') => `${base}/paths/:pathId/methods/:method`,
  testingDashboard: (base = '') => `${base}/testing`,
  exampleTestingDashboard: () => basePaths.exampleTestingDashboardBasePath
};

export function useRouterPaths() {
  const debugPrefix = useDebugPath();

  return Object.keys(routerPaths).reduce(
    (routesByName, routeName) => {
      let route = routesByName[routeName];
      if (typeof route === 'function') {
        let routeFn = route;
        // we're not passing the base url, as we want to use Path.join to deal with differences
        // in trailing slashes. Supporting functions is mostly for backwards-compatibility
        route = (...args) => join(debugPrefix, routeFn(...args));
      } else {
        route = join(debugPrefix, route);
      }
      routesByName[routeName] = route;

      return routesByName;
    },
    { ...routerPaths }
  );
}
