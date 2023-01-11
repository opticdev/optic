import { createHash } from 'crypto';
import stableStringify from 'json-stable-stringify';

export function computeChecksum(file: any): string {
  const hash = createHash('sha256');

  hash.update(stableStringify(file));

  return hash.digest('hex');
}
