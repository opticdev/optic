import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { getParameterIdentity, isParameterObject } from './array-identifiers';
import { isPathParameterArray, isPathsMap } from './openapi-matchers';
import { normalizeOpenApiPath } from '../openapi3/implementations/openapi3/openapi-traverser';

export type JSONValue =
  | null
  | string
  | number
  | boolean
  | JSONObject
  | JSONArray;

export type JSONArray = JSONValue[];

export type JSONObject = {
  [x: string]: JSONValue;
};

export type ObjectDiff =
  | {
      // Added
      before?: undefined;
      after: JSONPath;
      pathReconciliation?: undefined;
    }
  | {
      // Changed
      before: JSONPath;
      after: JSONPath;
      pathReconciliation?: undefined;
    }
  | {
      // Removed
      before: JSONPath;
      after?: undefined;
      // Required to maintain pointers from reordering array keys
      pathReconciliation: [number, string][];
    };

type JSONPath = string;

type StackItem<T extends JSONObject | JSONArray = JSONObject | JSONArray> = [
  {
    value: T;
    path: string;
  },
  {
    value: T;
    path: string;
  }
];

export function typeofDiff(
  diff: Omit<ObjectDiff, 'pathReconciliation'>
): 'added' | 'changed' | 'removed' {
  return diff.after !== undefined && diff.before !== undefined
    ? 'changed'
    : diff.after !== undefined
    ? 'added'
    : 'removed';
}

// Diffs two objects, generating the leaf nodes that have changes
export function diff(
  before: any,
  after: any,
  initialPath: string = ''
): ObjectDiff[] {
  const diffResults: ObjectDiff[] = [];
  const stack: StackItem[] = [
    [
      { value: before, path: initialPath },
      { value: after, path: initialPath },
    ],
  ];
  while (stack.length > 0) {
    const [before, after] = stack.pop()!;
    const comparisons: {
      beforeValue: JSONValue | undefined;
      beforePath: string;
      afterValue: JSONValue | undefined;
      afterPath: string;
    }[] = [];

    // TODO in the future, skip adding comparisons based on diff preprocessing step

    // Start by matching up values to compare - match up the before and after values by id
    // for arrays, we look at some known OpenAPI identifiers (such as parameters, or primitives) and fallback to using positional identity
    // for objects, we just use the key
    if (Array.isArray(before.value) && Array.isArray(after.value)) {
      const allValues = [...before.value, ...after.value];

      const arrayIdFn: (v: any, i: number) => string =
        isPathParameterArray(before.path) && isPathParameterArray(after.path)
          ? getParameterIdentity
          : allValues.every((v) => typeof v !== 'object')
          ? (v: any) => String(v)
          : (_, i: number) => String(i);

      const beforeValuesById: Map<string, [JSONValue, number]> = new Map(
        before.value.map((v, i) => [arrayIdFn(v, i), [v, i]])
      );
      const afterValuesById: Map<string, [JSONValue, number]> = new Map(
        after.value.map((v, i) => [arrayIdFn(v, i), [v, i]])
      );

      const keys = new Set([
        ...beforeValuesById.keys(),
        ...afterValuesById.keys(),
      ]);

      for (const key of keys) {
        const [beforeValue, beforeIdx] = beforeValuesById.get(key) ?? [];
        const [afterValue, afterIdx] = afterValuesById.get(key) ?? [];
        const beforePath = jsonPointerHelpers.append(
          before.path,
          String(beforeIdx)
        );
        const afterPath = jsonPointerHelpers.append(
          after.path,
          String(afterIdx)
        );

        comparisons.push({
          beforeValue,
          beforePath,
          afterValue,
          afterPath,
        });
      }
    } else if (!Array.isArray(before.value) && !Array.isArray(after.value)) {
      const objectIdFn: (key: string, v: any) => string =
        isPathsMap(before.path) && isPathsMap(after.path)
          ? (key) => normalizeOpenApiPath(key)
          : (key: string, value) => String(key);

      const beforeValuesById: Map<string, [JSONValue, string]> = new Map(
        Object.entries(before.value).map(([k, v]) => [objectIdFn(k, v), [v, k]])
      );
      const afterValuesById: Map<string, [JSONValue, string]> = new Map(
        Object.entries(after.value).map(([k, v]) => [objectIdFn(k, v), [v, k]])
      );

      const keys = new Set([
        ...beforeValuesById.keys(),
        ...afterValuesById.keys(),
      ]);

      for (const key of keys) {
        const [beforeValue, beforeId] = beforeValuesById.get(key) ?? [];
        const beforePath = jsonPointerHelpers.append(
          before.path,
          String(beforeId)
        );
        const [afterValue, afterId] = afterValuesById.get(key) ?? [];
        const afterPath = jsonPointerHelpers.append(
          after.path,
          String(afterId)
        );
        comparisons.push({
          beforeValue,
          beforePath,
          afterValue,
          afterPath,
        });
      }
    } else {
      throw new Error(
        'Unexpectedly found mismatch between array and object in diff traversal'
      );
    }

    // Once we've matched up comparisons to make, we can determine if a key is added, removed or changed
    // If both are objects / arrays, we continue the diff
    for (const {
      beforeValue,
      beforePath,
      afterValue,
      afterPath,
    } of comparisons) {
      if (beforeValue && afterValue === undefined) {
        // Because before + after paths can change diverge due to array rearrangement, we need to track this to determine from where something was removed in an after spec
        // We don't need to look at the last key to see path differences since
        const beforeParts = jsonPointerHelpers.decode(beforePath).slice(0, -1);
        const afterParts = jsonPointerHelpers.decode(afterPath).slice(0, -1);
        const pathReconciliation: [number, string][] = [];
        for (let i = 0; i < beforeParts.length; i++) {
          const before = beforeParts[i];
          const after = afterParts[i];
          if (before !== after) {
            pathReconciliation.push([i, after]);
          }
        }
        // generate path reconciliation
        diffResults.push({
          before: beforePath,
          pathReconciliation,
        });
      } else if (beforeValue === undefined && afterValue) {
        diffResults.push({
          after: afterPath,
        });
      } else {
        // Check if values are both objects OR both arrays, if they are continue traversing
        if (
          typeof beforeValue === 'object' &&
          beforeValue !== null &&
          typeof afterValue === 'object' &&
          afterValue !== null &&
          !Array.isArray(beforeValue) &&
          !Array.isArray(afterValue)
        ) {
          stack.push([
            { value: beforeValue, path: beforePath },
            { value: afterValue, path: afterPath },
          ]);
        } else if (
          typeof beforeValue === 'object' &&
          beforeValue !== null &&
          typeof afterValue === 'object' &&
          afterValue !== null &&
          Array.isArray(beforeValue) &&
          Array.isArray(afterValue)
        ) {
          stack.push([
            { value: beforeValue, path: beforePath },
            { value: afterValue, path: afterPath },
          ]);
        }
        // Next, check if values are the same (strict equality, no deep comparison)
        else if (beforeValue === afterValue) {
          // do nothing, because the values are the same
          // this will fail if types mismatch
        } else {
          diffResults.push({
            before: beforePath,
            after: afterPath,
          });
        }
      }
    }
  }

  return diffResults;
}

export function reconcileDiff(diff: ObjectDiff): ObjectDiff {
  if (diff.pathReconciliation) {
    const previousPath = diff.before;
    const parts = jsonPointerHelpers.decode(previousPath);
    for (const [index, replacement] of diff.pathReconciliation) {
      parts[index] = replacement;
    }

    return {
      before: jsonPointerHelpers.compile(parts),
      after: undefined,
      pathReconciliation: [],
    };
  } else {
    return diff;
  }
}
