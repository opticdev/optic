import { createHash } from 'crypto';

export function computeChecksum(file: string): string {
  const hash = createHash('sha256');

  hash.update(file);

  return hash.digest('base64');
}
