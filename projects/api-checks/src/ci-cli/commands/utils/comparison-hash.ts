import { createHash } from 'crypto';
import stableStringify from 'json-stable-stringify';
import { IChange, ResultWithSourcemap } from '@useoptic/openapi-utilities';

type Comparison = {
  results: ResultWithSourcemap[];
  changes: IChange[];
};

export const generateHashForComparison = (
  comparison: Comparison | Comparison[]
): string => {
  const hash = createHash('sha256');
  if (Array.isArray(comparison)) {
    for (const comp of comparison) {
      hash.update(stableStringify(comp));
    }
  } else {
    hash.update(stableStringify(comparison));
  }

  return hash.digest('hex');
};
