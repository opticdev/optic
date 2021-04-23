import { useContext, useEffect, useState } from 'react';
import { CapturesServiceContext } from './useCapturesHook';
import { IUnrecognizedUrl } from '@useoptic/spectacle';

interface DiffState {
  diffs: any[];
  urls: IUnrecognizedUrl[];
  loading?: boolean;
  error?: any;
}

export function useDiffsForCapture(
  captureId: string,
  diffId: string
): DiffState {
  const capturesService = useContext(CapturesServiceContext)!;
  const [diffState, setDiffState] = useState<DiffState>({
    loading: true,
    diffs: [],
    urls: [],
  });
  useEffect(() => {
    async function task() {
      const startDiffResult = await capturesService.startDiff(
        diffId,
        captureId
      );
      const diffsService = await startDiffResult.onComplete;
      const diffs = await diffsService.listDiffs();
      const urls = await diffsService.listUnrecognizedUrls();
      setDiffState({ loading: false, diffs: diffs.diffs, urls: urls.urls });
    }

    task();
  }, [capturesService, captureId, diffId]);
  return diffState;
}
