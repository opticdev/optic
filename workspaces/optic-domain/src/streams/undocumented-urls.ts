import { DiffResult } from './diff-results';
import { lastBy } from '../async-tools';

// TODO: find a better spot for this, combining the single unit + collection logic
// leads to circular dependencies. E.g. as it stands, we can't implement a
// fromDiffResults here, as DiffResults streams require this UndocumentedUrl type
export type UndocumentedUrl = {
  path: string;
  method: string;
  count: number;
  fingerprint: string;
};

export async function* fromDiffResults(
  diffResults: AsyncIterable<DiffResult>
): AsyncIterable<UndocumentedUrl> {
  let countsByFingerprint: Map<String, number> = new Map();

  for await (let [diff, _pointers, fingerprint] of diffResults) {
    let urlDiff = diff['UnmatchedRequestUrl'];
    if (!urlDiff || !fingerprint) continue;

    let existingCount = countsByFingerprint.get(fingerprint) || 0;
    let path = urlDiff.interactionTrail.path.find(
      (interactionComponent: any) =>
        interactionComponent.Url && interactionComponent.Url.path
    ).Url.path as string;
    let method = urlDiff.interactionTrail.path.find(
      (interactionComponent: any) =>
        interactionComponent.Method && interactionComponent.Method.method
    ).Method.method as string;

    let newCount = existingCount + 1;
    countsByFingerprint.set(fingerprint, newCount);

    yield { path, method, fingerprint, count: newCount };
  }
}

// yield each last unique undocumented url (using fingerprint as identity)
export const lastUnique = lastBy(
  ({ fingerprint }: UndocumentedUrl) => fingerprint
);
