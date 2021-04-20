import { BodyShapeDiff, ParsedDiff } from '../../../lib/parse-diff';
import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '@useoptic/cli-shared/build/diffs/initial-types';
import { SpectacleContext } from '../../../spectacle-implementations/spectacle-provider';
import { interpretShapeDiffs } from '../../../lib/shape-diffs/shape-diffs';
import { useContext, useEffect, useState } from 'react';
import { IInterpretation } from '../../../lib/Interfaces';
import { useSharedDiffContext } from './SharedDiffContext';

export function useShapeDiffInterpretations(
  diffs: BodyShapeDiff[],
  trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash,
): { loading: boolean; results: IInterpretation[] } {
  const spectacle = useContext(SpectacleContext)!;
  const { currentSpecContext } = useSharedDiffContext();

  const [results, setResults] = useState<IInterpretation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function computeDiffInterpretation(diff: BodyShapeDiff) {
    const learnedTrails = trailValues[diff.diffHash()];
    return await interpretShapeDiffs(
      diff,
      learnedTrails,
      spectacle,
      currentSpecContext,
    );
  }

  useEffect(() => {
    setLoading(true);
    Promise.all(diffs.map(computeDiffInterpretation)).then((diffs) => {
      setResults(diffs);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diffs]);

  return { results, loading };
}

////////////////////////////////////////////////////////////////////////

export function useNewRegionDiffInterpretations(
  diffs: ParsedDiff[],
  trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash,
) {}
