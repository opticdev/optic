import { IUndocumentedUrl } from './SharedDiffState';
import { useSharedDiffContext } from './SharedDiffContext';

export function useUndocumentedUrls(): IUndocumentedUrl[] {
  const diffState = useSharedDiffContext();
  return diffState.context.results?.displayedUndocumentedUrls || [];
}
