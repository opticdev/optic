import { StableHashableWrapper } from '@useoptic/domain';
import crypto from 'crypto';

function hasher(input: string) {
  const sha1 = crypto.createHash('sha1');
  sha1.update(input);
  const hex = sha1.digest('hex');
  return hex;
}

export const StableHasher = StableHashableWrapper(hasher);
