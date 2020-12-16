type DiffResult = [any, string[], string];
type UndocumentedUrl = {
  path: string;
  method: string;
  count: number;
  fingerprint: string;
};

// TOOD: more strictly type the interaction diff result
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

export async function* undocumentedUrls(
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
