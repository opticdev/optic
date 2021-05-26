import { lastBy } from '../async-tools';
import { fromReadableJSONL } from '../async-tools';
import { Readable } from 'stream';

// TODO: more strictly type the interaction diff result. Move them over from
// workspaces/cli-shared/diffs/diffs to the diff-engine-wasm
export type DiffResult = [any, string[], string];

export function fromJSONL(): (source: Readable) => AsyncIterable<DiffResult> {
  return fromReadableJSONL();
}

export async function* normalize(
  diffResults: AsyncIterable<DiffResult>
): AsyncIterable<DiffResult> {
  let pointersByFingerprint: Map<String, string[]> = new Map();

  for await (let [diff, pointers, fingerprint] of diffResults) {
    let existingPointers = pointersByFingerprint.get(fingerprint) || [];
    let newPointers = [...existingPointers, ...pointers];
    pointersByFingerprint.set(fingerprint, newPointers);

    yield [diff, [...newPointers], fingerprint];
  }
}

export { fromDiffResults as intoUndocumentedUrls } from './undocumented-urls';

// yield each last unique diff result (using fingerprint as identity)
export const lastUnique = lastBy(
  ([_diff, _tags, fingerprint]: DiffResult) => fingerprint
);
