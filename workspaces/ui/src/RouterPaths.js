import {useBaseUrl} from './contexts/BaseUrlContext';

const routerPaths = {
  testingDashboard: (base = '') => `${base}/testing`,
  documentationPage: (base = '') => `${base}/documentation`,
  expandedDocsPage: (base = '') => `${base}/documentation/paths/:pathId/methods/:method`,
  diffPage: (base = '') => `${base}/diffs`,
  diffPageWithCapture: (base = '') => `${base}/diffs/:captureId`,
  diffRequest: (base = '') => `${base}/diffs/:captureId/paths/:pathId/methods/:method`,
};

export function useRouterPaths() {
  const baseUrl = useBaseUrl();

  return Object
    .entries(routerPaths)
    .reduce(
      (routesByName, entry) => {
        const [routeName, route] = entry;
        if (typeof route === 'function') {
          routesByName[routeName] = route(baseUrl);
        }

        return routesByName;
      },
      {}
    );
}
