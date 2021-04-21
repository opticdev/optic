import { Readable } from 'stream';
import { fromReadableJSONL, lastBy, reduce } from '../../async-tools';

export interface ShapeDiffAffordances {
  affordances: any[];
  interactions: any[];
}
export type DiffFingerprint = string;
export type ShapeDiffAffordancesResult = [
  ShapeDiffAffordances,
  DiffFingerprint
];

export function fromJSONL(): (
  source: Readable
) => AsyncIterable<ShapeDiffAffordancesResult> {
  return fromReadableJSONL();
}

// yield each last unique diff result (using fingerprint as identity)
export const lastUnique = lastBy(
  ([_affordances, fingerprint]: ShapeDiffAffordancesResult) => fingerprint
);

export function affordancesByFingerprint(): (
  source: AsyncIterable<ShapeDiffAffordancesResult>
) => Promise<{ [fingerprint: string]: ShapeDiffAffordances }> {
  return reduce(
    (
      affordancesByFingerprint: { [fingerprint: string]: ShapeDiffAffordances },
      [affordance, fingerprint]
    ) => {
      affordancesByFingerprint[fingerprint] = affordance;
      return affordancesByFingerprint;
    },
    {}
  );
}
