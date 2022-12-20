import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { getArrayValueId } from './array-identifiers';

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
      after: string;
    }
  | {
      // Changed
      before: string;
      after: string;
    }
  | {
      // Removed
      before: string;
      after?: undefined;
      // Required to maintain pointers from reordering array keys
      pathReconciliation?: [number, number][];
    };

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

// Diffs two objects, generating the leaf nodes that have changes
export function diff<T extends JSONObject | JSONArray = JSONObject | JSONArray>(
  before: T,
  after: T
): ObjectDiff[] {
  const diffResults: ObjectDiff[] = [];
  const stack: StackItem[] = [
    [
      { value: before, path: '' },
      { value: after, path: '' },
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

    // Start by matching up values to compare
    // for arrays, we need to match up
    if (Array.isArray(before.value) && Array.isArray(after.value)) {
      const beforeValuesById = new Map(
        before.value.map((v, i) => [getArrayValueId(v, i), v])
      );
      const afterValuesById = new Map(
        after.value.map((v, i) => [getArrayValueId(v, i), v])
      );

      const keys = new Set([
        ...beforeValuesById.keys(),
        ...afterValuesById.keys(),
      ]);
      for (const key of keys) {
        const beforeValue = beforeValuesById.get(key);
        const beforePath = jsonPointerHelpers.append(before.path, key);
        const afterValue = afterValuesById.get(key);
        const afterPath = jsonPointerHelpers.append(after.path, key);
        comparisons.push({
          beforeValue,
          beforePath,
          afterValue,
          afterPath,
        });
      }
    } else if (!Array.isArray(before.value) && !Array.isArray(after.value)) {
      const keys = new Set([
        ...Object.keys(before.value),
        ...Object.keys(after.value),
      ]);

      for (const key of keys) {
        const beforeValue = before.value[key];
        const beforePath = jsonPointerHelpers.append(before.path, key);
        const afterValue = after.value[key];
        const afterPath = jsonPointerHelpers.append(after.path, key);
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

    for (const {
      beforeValue,
      beforePath,
      afterValue,
      afterPath,
    } of comparisons) {
      if (beforeValue && !afterValue) {
        diffResults.push({
          before: beforePath,
        });
      } else if (!beforeValue && afterValue) {
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
