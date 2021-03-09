import { useBaseUrl } from '../hooks/useBaseUrl';

export const useDocumentationPageLink: () => {
  path: string;
  linkTo: () => string;
} = () => {
  const baseUrl = useBaseUrl();
  const url = `${baseUrl}/documentation`;
  return {
    path: url,
    linkTo: () => url
  };
};
export const useEndpointPageLink: () => {
  path: string;
  linkTo: (pathId: string, method: string) => string;
} = () => {
  const documentationPage = useDocumentationPageLink();
  return {
    path: `${documentationPage.path}/paths/:pathId/methods/:method`,
    linkTo: (pathId: string, method: string) =>
      `${documentationPage.path}/paths/${pathId}/methods/${method}`
  };
};
// Diff use cases
export const useDiffReviewPageLink: () => {
  path: string;
  linkTo: () => string;
} = () => {
  const baseUrl = useBaseUrl();
  const url = `${baseUrl}/review`;
  return {
    path: url,
    linkTo: () => url
  };
};
// Setup page use cases
export const useSetupPageLink: () => {
  path: string;
  linkTo: () => string;
} = () => {
  const baseUrl = useBaseUrl();
  const url = `${baseUrl}/setup`;
  return {
    path: url,
    linkTo: () => url
  };
};