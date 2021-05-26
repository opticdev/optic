import { IUndocumentedUrl } from './SharedDiffState';
import { useSharedDiffContext } from './SharedDiffContext';

export function useUndocumentedUrls(): IUndocumentedUrl[] {
  const { getUndocumentedUrls } = useSharedDiffContext();
  return getUndocumentedUrls();
}
