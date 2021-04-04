import { BodyShapeDiff, ParsedDiff } from '../../../lib/parse-diff';
import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '@useoptic/cli-shared/build/diffs/initial-types';
import isEqual from 'lodash.isequal';
import {
  IgnoreRule,
  transformAffordanceMappingByIgnoreRules,
} from '../../../lib/ignore-rule';
import { useSpectacleRawQuery } from '../../../spectacle-implementations/spectacle-provider';
import { interpretShapeDiffs } from '../../../lib/shape-diffs/shape-diffs';
import { useEffect, useState } from 'react';
import { IInterpretation } from '../../../lib/Interfaces';

export function useShapeDiffInterpretations(
  diffs: BodyShapeDiff[],
  trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash,
  ignoreRules: IgnoreRule[]
): { loading: boolean; results: IInterpretation[] } {
  const query = useSpectacleRawQuery();

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

    const abc = await interpretShapeDiffs(diff, trailsWithIgnored, query);

    return abc;
  }

  useEffect(() => {
    setLoading(true);
    Promise.all(diffs.map(computeDiffInterpretation)).then((diffs) => {
      setResults(diffs);
      setLoading(false);
    });
    //@ts-ignore
  }, [diffs, ignoreRules]);

  return { results, loading };
}

////////////////////////////////////////////////////////////////////////

export function useNewRegionDiffInterpretations(
  diffs: ParsedDiff[],
  trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash
) {}
