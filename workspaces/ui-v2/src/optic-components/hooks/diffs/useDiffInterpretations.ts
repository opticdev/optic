import { BodyShapeDiff, ParsedDiff } from '../../../lib/parse-diff';
import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '@useoptic/cli-shared/build/diffs/initial-types';
import { transformAffordanceMappingByIgnoreRules } from '../../../lib/ignore-rule';
import { useSpectacleRawQuery } from '../../../spectacle-implementations/spectacle-provider';
import { interpretShapeDiffs } from '../../../lib/shape-diffs/shape-diffs';
import { useEffect, useState } from 'react';
import {
  IInteractionPreviewTab,
  IInterpretation,
  ISuggestion,
} from '../../../lib/Interfaces';
import { ICopy } from '../../diffs/render/ICopyRender';

export function useShapeDiffInterpretations(
  diffs: BodyShapeDiff[],
  trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash
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
      []
    );

    return await interpretShapeDiffs(diff, trailsWithIgnored, query);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all(diffs.map(computeDiffInterpretation)).then((diffs) => {
      setResults(diffs);
      setLoading(false);
    });
  }, [diffs]);

  return { results, loading };
}

////////////////////////////////////////////////////////////////////////

export function useNewRegionDiffInterpretations(
  diffs: ParsedDiff[],
  trailValues: IValueAffordanceSerializationWithCounterGroupedByDiffHash
) {}
