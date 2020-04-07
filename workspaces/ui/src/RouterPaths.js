import {join} from 'path';
import {useBaseUrl} from './contexts/BaseUrlContext';

// TODO: migrate away from various base paths. Everything is from root, unless prefixed ???

// TODO: migrate away from routes as functions ???
export const routerPaths = {
  //@todo -- replace the old flow with this one
  testingDashboard: (base = '') => `${base}/testing`,
  documentationPage: (base = '') => `${base}/documentation`, //???
  expandedDocsPage: (base = '') => `${base}/documentation/paths/:pathId/methods/:method`,
  diffPage: (base = '') => `${base}/diff`,//???
  diffPageWithCapture: (base = '') => `${base}/diff/:captureId`,
  diffRequest: (base = '') => `${base}/diff/:captureId/paths/:pathId/methods/:method`,
};

export function useRouterPaths() {
  const debugPrefix = useBaseUrl();

  return Object.keys(routerPaths).reduce(
    (routesByName, routeName) => {
      let route = routesByName[routeName];
      if (typeof route === 'function') {
        let routeFn = route;
        // we're not passing the base url, as we want to use Path.join to deal with differences
        // in trailing slashes. Supporting functions is mostly for backwards-compatibility
        // ??? urljoin?
        route = (...args) => join(debugPrefix, routeFn(...args));
      } else {
        route = join(debugPrefix, route);
      }
      routesByName[routeName] = route;

      return routesByName;
    },
    {...routerPaths}
  );
}
