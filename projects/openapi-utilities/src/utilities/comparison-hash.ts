import { createHash } from 'crypto';
import stableStringify from 'json-stable-stringify';
import { IChange, ResultWithSourcemap } from '../index';

type Comparison = {
  results: ResultWithSourcemap[];
  changes: IChange[];
};

// We strip out the sourcemap, since the effective change doesn't care about where in the file the sourcemap is
const sanitizeComparison = (comparison: Comparison): Comparison => {
  return {
    results: comparison.results.map((r) => ({
      ...r,
      sourcemap: undefined,
    })),
    changes: comparison.changes.map((c) => ({
      ...c,
      location: {
        ...c.location,
        sourcemap: undefined,
      },
    })) as IChange[],
  };
};

export const generateHashForComparison = (
  comparison: Comparison | Comparison[]
): string => {
  const hash = createHash('sha256');
  if (Array.isArray(comparison)) {
    for (const comp of comparison) {
      hash.update(stableStringify(sanitizeComparison(comp)));
    }
  } else {
    hash.update(stableStringify(sanitizeComparison(comparison)));
  }

  return hash.digest('hex');
};
