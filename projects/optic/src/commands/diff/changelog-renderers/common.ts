import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3 } from 'openapi-types';
import { Diff } from '@useoptic/openapi-utilities/build/openapi3/group-diff';

export function getRootBodyPath(path: string): string {
  const parts = jsonPointerHelpers.decode(path);
  if (parts[3] === 'responses') {
    return jsonPointerHelpers.compile(parts.slice(0, 7));
  } else {
    return jsonPointerHelpers.compile(parts.slice(0, 6));
  }
}
export function interpretFieldLevelDiffs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  diffs: Record<string, { diffs: Diff[] }>
): Diff[] {
  return Object.entries(diffs).map(([key, { diffs }]) => {
    const firstDiffPath = diffs[0].after ?? diffs[0].before;

    // TODO figure out if we need to handle path reconciliation here
    // This might only be an issue with nested enums + rearranging + removing keys with oneOf/anyOf/allOf
    const absolutePath = jsonPointerHelpers.join(
      getRootBodyPath(firstDiffPath),
      key
    );
    const beforeRaw = jsonPointerHelpers.tryGet(specs.from, absolutePath);
    const afterRaw = jsonPointerHelpers.tryGet(specs.to, absolutePath);
    const before = beforeRaw.match ? absolutePath : undefined;
    const after = afterRaw.match ? absolutePath : undefined;

    return {
      before,
      after,
      trail: key,
      change: before && after ? 'changed' : before ? 'removed' : 'added',
    } as Diff;
  });
}
