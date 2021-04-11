import { useContext, useEffect, useState } from 'react';
import { CapturesServiceContext } from './useCapturesHook';

interface DiffState {
  diffs: any[];
  loading?: boolean;
  error?: any;
}

export function useDiffsForCapture(captureId: string, diffId: string): DiffState {
  const capturesService = useContext(CapturesServiceContext)!;
  const [diffState, setDiffState] = useState<DiffState>({loading: true, diffs: []});
  useEffect(() => {
    async function task() {
      const startDiffResult = await capturesService.startDiff(diffId, captureId)
      const diffsService = await startDiffResult.onComplete
      const diffs = await diffsService.listDiffs();
      setDiffState({loading: false, diffs: diffs.diffs })
    }

    task();
  }, [capturesService, captureId, diffId]);
  return diffState;
}
