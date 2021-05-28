import { IUndocumentedUrl } from '../contexts/SharedDiffState';
import { useSharedDiffContext } from '../contexts/SharedDiffContext';

export function useUndocumentedUrls(): IUndocumentedUrl[] {
  const { getUndocumentedUrls } = useSharedDiffContext();
  return getUndocumentedUrls();
}
