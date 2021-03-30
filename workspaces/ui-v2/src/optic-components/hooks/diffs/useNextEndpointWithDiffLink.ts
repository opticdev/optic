import { useSharedDiffContext } from './SharedDiffContext';
import {
  useDiffForEndpointLink,
  useDiffUndocumentedUrlsPageLink,
} from '../../navigation/Routes';

export function useNextEndpointLink(): string {
  const { context, isDiffHandled } = useSharedDiffContext();
  const diffsGroupedByEndpoints = context.results.diffsGroupedByEndpoint;

  const diffUndocumentedUrlsPageLink = useDiffUndocumentedUrlsPageLink();
  const diffForEndpointLink = useDiffForEndpointLink();

  const next = diffsGroupedByEndpoints.find((i) => {
    const hasUnhandledShapeDiff = i.shapeDiffs.some(
      (i) => !isDiffHandled(i.diffHash())
    );
    return hasUnhandledShapeDiff;
  });

  if (next) {
    return diffForEndpointLink.linkTo(next.pathId, next.method);
  } else {
    return diffUndocumentedUrlsPageLink.linkTo();
  }
}
