import { useContext, useEffect, useState } from 'react';
import { CapturesServiceContext } from './useCapturesHook';
import { IOpticDiffService, IUnrecognizedUrl } from '@useoptic/spectacle';
import { ParsedDiff } from '../../lib/parse-diff';
import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '@useoptic/cli-shared/build/diffs/initial-types';

interface DiffState {
  data?: {
    diffs: ParsedDiff[];
    urls: IUnrecognizedUrl[];
    trails: IValueAffordanceSerializationWithCounterGroupedByDiffHash;
    diffService: IOpticDiffService;
  };
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
  });

  useEffect(() => {
    async function task() {
      const startDiffResult = await capturesService.startDiff(
        diffId,
        captureId
      );
      const diffsService = await startDiffResult.onComplete;
      const diffs = await diffsService.listDiffs();

      const parsedDiffs = diffs.diffs.map(
        (i: any) => new ParsedDiff(i[0], i[1], i[2])
      );

      const learnedTrailsForEndpoints = await diffsService.learnShapeDiffAffordances();

      const urls = await diffsService.listUnrecognizedUrls();
      setDiffState({
        loading: false,
        data: {
          diffs: parsedDiffs,
          urls: urls.urls,
          trails: learnedTrailsForEndpoints,
          diffService: diffsService,
        },
      });
    }

    task();
  }, [capturesService, captureId, diffId]);
  return diffState;
}
