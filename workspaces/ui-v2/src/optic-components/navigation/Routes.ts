import { useBaseUrl } from '../hooks/useBaseUrl';
import { useParams } from 'react-router-dom';

export const useDocumentationPageLink: () => {
  path: string;
  linkTo: () => string;
} = () => {
  const baseUrl = useBaseUrl();
  const url = `${baseUrl}/documentation`;
  return {
    path: url,
    linkTo: () => url,
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
      `${documentationPage.path}/paths/${pathId}/methods/${method}`,
  };
};
// Diff use cases
export const useDiffReviewPageLink: () => {
  path: string;
  linkTo: () => string;
} = () => {
  const baseUrl = useBaseUrl();
  const url = `${baseUrl}/diffs`;
  return {
    path: url,
    linkTo: () => url,
  };
};

export const useDiffEnvironmentsRoot: () => {
  path: string;
  linkTo: (environment: string, boundaryId: string) => string;
} = () => {
  const parentUrl = useDiffReviewPageLink();
  const url = `${parentUrl.path}/:environment/:boundaryId`;
  return {
    path: url,
    linkTo: (environment: string, boundaryId: string) =>
      `${parentUrl.linkTo()}/${environment}/${boundaryId}`,
  };
};

export const useDiffReviewPagePendingEndpoint: () => {
  path: string;
  linkTo: (pendingId: string) => string;
} = () => {
  const parentUrl = useDiffEnvironmentsRoot();
  const url = `${parentUrl.path}/pending/:endpointId`;
  const { environment, boundaryId } = useParams<{
    environment: string;
    boundaryId: string;
  }>();
  return {
    path: url,
    linkTo: (pendingId: string) =>
      `${parentUrl.linkTo(environment, boundaryId)}/pending/${pendingId}`,
  };
};

export const useDiffUndocumentedUrlsPageLink: () => {
  path: string;
  linkTo: () => string;
} = () => {
  const parentUrl = useDiffEnvironmentsRoot();
  const url = `${parentUrl.path}/urls`;
  const { environment, boundaryId } = useParams<{
    environment: string;
    boundaryId: string;
  }>();
  return {
    path: url,
    linkTo: () => `${parentUrl.linkTo(environment, boundaryId)}/urls`,
  };
};

export const useDiffReviewCapturePageLink: () => {
  path: string;
  linkTo: () => string;
} = () => {
  const parentUrl = useDiffEnvironmentsRoot();
  const url = `${parentUrl.path}/review`;
  const { environment, boundaryId } = useParams<{
    environment: string;
    boundaryId: string;
  }>();
  return {
    path: url,
    linkTo: () => `${parentUrl.linkTo(environment, boundaryId)}/review`,
  };
};

export const useDiffForEndpointLink: () => {
  path: string;
  linkTo: (pathId: string, method: string) => string;
} = () => {
  const parentUrl = useDiffEnvironmentsRoot();
  const { environment, boundaryId } = useParams<{
    environment: string;
    boundaryId: string;
  }>();
  const url = `${parentUrl.path}/paths/:pathId/methods/:method`;
  return {
    path: url,
    linkTo: (pathId: string, method: string) =>
      `${parentUrl.linkTo(
        environment,
        boundaryId,
      )}/paths/${pathId}/methods/${method}`,
  };
};

// changelog pages

export const useChangelogPages: () => {
  path: string;
  linkTo: (sinceBatchCommitId: string) => string;
} = () => {
  const baseUrl = useBaseUrl();
  const path = `${baseUrl}/changes-since/:batchId`;
  return {
    path: path,
    linkTo: (sinceBatchCommitId) =>
      `${baseUrl}/changes-since/${sinceBatchCommitId}`,
  };
};

export const useChangelogEndpointPageLink: () => {
  path: string;
  linkTo: (
    sinceBatchCommitId: string,
    pathId: string,
    method: string,
  ) => string;
} = () => {
  const changelogRoot = useChangelogPages();
  return {
    path: `${changelogRoot.path}/paths/:pathId/methods/:method`,
    linkTo: (sinceBatchCommitId: string, pathId: string, method: string) =>
      `${changelogRoot.linkTo(
        sinceBatchCommitId,
      )}/paths/${pathId}/methods/${method}`,
  };
};
