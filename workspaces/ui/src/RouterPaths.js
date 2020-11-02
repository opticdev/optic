import { useBaseUrl } from './contexts/BaseUrlContext';

const routerPaths = {
  testingDashboard: (base = '') => `${base}/testing`,
  testingCapture: (base = '') => `${base}/testing/captures/:captureId`,
  testingEndpointDetails: (base = '') =>
    `${base}/testing/captures/:captureId/endpoints/:endpointId`,
  docsRoot: (base = '') => `${base}/documentation`,
  requestDocsRoot: (base = '') =>
    `${routerPaths.docsRoot(base)}/paths/:pathId/methods/:method`,
  diffsRoot: (base = '') => `${base}/diffs`,
  reviewRoot: (base = '') => `${base}/review`,
  reviewRootWithBoundary: (base = '') => `${base}/review/:boundaryId`,
  reviewFinalize: (base = '') => `${base}/review/:boundaryId/finalize`,
  captureRoot: (base = '') => `${routerPaths.diffsRoot(base)}/:captureId`,
  captureRequestDiffsRoot: (base = '') =>
    `${routerPaths.captureRoot(base)}/paths/:pathId/methods/:method`,
};

export function useRouterPaths() {
  const baseUrl = useBaseUrl();

  return Object.entries(routerPaths).reduce((routesByName, entry) => {
    const [routeName, route] = entry;
    if (typeof route === 'function') {
      routesByName[routeName] = route(baseUrl);
    }

    return routesByName;
  }, {});
}
