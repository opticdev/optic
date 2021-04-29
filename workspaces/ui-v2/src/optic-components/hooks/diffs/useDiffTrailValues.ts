import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '@useoptic/cli-shared/build/diffs/initial-types';

export function useDiffTrailValues(): {
  loading?: boolean;
  trails?: IValueAffordanceSerializationWithCounterGroupedByDiffHash;
} {
  return {
    trails: {},
  };
}
