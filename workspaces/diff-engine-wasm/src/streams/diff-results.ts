import { lastBy } from '../async-tools';

// TODO: more strictly type the interaction diff result
export type DiffResult = [any, string[], string];

export async function* normalize(
  diffResults: AsyncIterable<DiffResult>
): AsyncIterable<DiffResult> {
  let pointersByFingerprint: Map<String, string[]> = new Map();

  for await (let [diff, pointers, fingerprint] of diffResults) {
    if (!fingerprint) yield [diff, pointers, fingerprint];

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
