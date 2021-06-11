import { useContext, useEffect, useState } from 'react';
import { CapturesServiceContext } from '<src>/hooks/useCapturesHook';
import { IOpticDiffService, IUnrecognizedUrl } from '@useoptic/spectacle';
import { ParsedDiff } from '<src>/lib/parse-diff';
import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '@useoptic/cli-shared/build/diffs/initial-types';
import { useAnalytics } from '<src>/contexts/analytics';
import { selectors, useAppSelector } from '<src>/store';

interface DiffState {
  data?: {
    durationMillis: number;
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
  const analytics = useAnalytics();
  const endpoints = selectors.filterRemovedEndpoints(
    useAppSelector(selectors.getAssertedEndpoints)
  );
  const [diffState, setDiffState] = useState<DiffState>({
    loading: true,
  });

  useEffect(() => {
    async function task() {
      const startTime = Date.now();
      console.count('startDiff');
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

      const endTime = Date.now();

      const urls = await diffsService.listUnrecognizedUrls();

      setDiffState({
        loading: false,
        data: {
          durationMillis: endTime - startTime,
          diffs: parsedDiffs,
          urls: urls.urls,
          trails: learnedTrailsForEndpoints,
          diffService: diffsService,
        },
      });
    }

    task();
  }, [capturesService, captureId, diffId]);

  useEffect(() => {
    if (diffState.data) {
      analytics.reviewPageLoaded(
        diffState.data.diffs.length,
        diffState.data.urls.length,
        diffState.data.durationMillis,
        endpoints.length
      );
    }
  }, [diffState, endpoints, analytics]);

  return diffState;
}
