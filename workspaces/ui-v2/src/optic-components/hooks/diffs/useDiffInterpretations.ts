import { BodyShapeDiff, ParsedDiff } from '../../../lib/parse-diff';
import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '@useoptic/cli-shared/build/diffs/initial-types';
import {
  IgnoreRule,
  transformAffordanceMappingByIgnoreRules,
} from '../../../lib/ignore-rule';
import { SpectacleContext } from '../../../spectacle-implementations/spectacle-provider';
import { interpretShapeDiffs } from '../../../lib/shape-diffs/shape-diffs';
import { useContext, useEffect, useState } from 'react';
import { IInterpretation } from '../../../lib/Interfaces';
import { useSharedDiffContext } from './SharedDiffContext';

export function useShapeDiffInterpretations(
  diffs: BodyShapeDiff[],
  trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash,
  ignoreRules: IgnoreRule[]
): { loading: boolean; results: IInterpretation[] } {
  const spectacle = useContext(SpectacleContext)!;
  const { currentSpecContext } = useSharedDiffContext();

  const [results, setResults] = useState<IInterpretation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function computeDiffInterpretation(diff: BodyShapeDiff) {
    const learnedTrails = trailValues[diff.diffHash()];

    const trailsWithIgnored = transformAffordanceMappingByIgnoreRules(
      learnedTrails,
      diff.diffHash(),
      diff.jsonTrail,
      ignoreRules
    );

    return await interpretShapeDiffs(
      diff,
      trailsWithIgnored,
      spectacle,
      currentSpecContext
    );
  }

  useEffect(() => {
    setLoading(true);
    Promise.all(diffs.map(computeDiffInterpretation)).then((diffs) => {
      setResults(diffs);
      setLoading(false);
    });
  }, [diffs, ignoreRules]);

  return { results, loading };
}

////////////////////////////////////////////////////////////////////////

export function useNewRegionDiffInterpretations(
  diffs: ParsedDiff[],
  trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash
) {}
