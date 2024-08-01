import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import cloneDeep from 'lodash.clonedeep';
import type { ObjectDiff, RuleResult } from '@useoptic/openapi-utilities';
import { reconcileDiff } from '@useoptic/openapi-utilities';

export const od = Symbol.for('optic_diffs');
export const or = Symbol.for('optic_results');

export type Changelog<T> =
  | {
      type: 'added';
    }
  | {
      type: 'changed';
      before: T;
    }
  | {
      type: 'removed';
      before: T;
    };

export type OpticDiffs<T extends object | undefined> = {
  added?: Partial<{
    [K in keyof T]: Changelog<T[K]> & { type: 'added' };
  }>;
  changed?: Partial<{
    [K in keyof T]: Changelog<T[K]> & { type: 'changed' };
  }>;
  removed?: Partial<{
    [K in keyof T]: Changelog<T[K]> & { type: 'removed' };
  }>;
  hasNestedChanges?: boolean;
};

export type WithOpticDiffs<T extends object | undefined> = T & {
  [od]?: OpticDiffs<T>;
};

export type WithOpticResults<T extends object | undefined> = T & {
  [or]?: RuleResult[];
};

export type ChangelogTree<T> = ([T] extends [object | undefined]
  ? [
      {
        [K in keyof T]: ChangelogTree<T[K]>;
      } & WithOpticDiffs<T> &
        WithOpticResults<T>,
    ]
  : [T])[0];

const getIn = (tree: object, pathSegments: string[]): any => {
  let obj: any = tree;
  for (const [ix, pathSegment] of pathSegments.entries()) {
    if (!(pathSegment in obj)) {
      if (ix === pathSegments.length - 1) {
        return undefined;
      } else {
        throw new Error(
          `getIn: invalid "${pathSegment}" path at index ${ix} of ${pathSegments.join(
            '/'
          )}. ${
            obj === 'null'
              ? `obj is null`
              : typeof obj === 'object'
                ? `Object keys are ${Object.keys(obj)}`
                : `obj is ${typeof obj}`
          }`
        );
      }
    }
    obj = obj[pathSegment];
  }
  return obj;
};

const setInDiff = <T>(
  tree: T,
  pathSegments: string[],
  changelog: Changelog<any>
): T => {
  const changelogType = changelog.type;
  const parentLocation = pathSegments.slice(0, -1);
  const childKey = pathSegments.at(-1);
  if (!childKey) throw new Error('empty path');

  let obj: any = tree;
  obj[od] = {
    ...(obj[od] ?? {}),
    hasNestedChanges: true,
  };
  for (const path of parentLocation) {
    if (!obj || !(path in obj)) {
      throw new Error(
        `setIn: invalid "${path}" path in ${parentLocation.join('/')}`
      );
    }

    obj = obj[path];

    obj[od] = {
      ...(obj[od] ?? {}),
      hasNestedChanges: true,
    };
  }

  if (!obj || typeof obj !== 'object') throw new Error('Expected an object');

  obj[od] = {
    ...(obj[od] ?? {}),
    [changelogType]: {
      ...(obj[od]?.[changelogType] ?? {}),
      [childKey]: changelog,
    },
  };
  return tree;
};

export const setInResult = <T>(
  tree: T,
  pathSegments: string[],
  result: RuleResult
) => {
  let obj: any = tree;

  obj[od] = {
    ...(obj[od] ?? {}),
    hasNestedChanges: true,
  };

  for (const [ix, pathSegment] of pathSegments.entries()) {
    const nextObj =
      result.location.spec === 'before'
        ? obj?.[od]?.removed?.[pathSegment]?.before ?? obj[pathSegment]
        : obj[pathSegment];
    if (
      !nextObj ||
      typeof nextObj !== 'object' ||
      ix === pathSegments.length - 1
    ) {
      const target =
        !!nextObj &&
        typeof nextObj === 'object' &&
        ix === pathSegments.length - 1
          ? nextObj
          : obj;
      target[or] = [...(target[or] ?? []), result];
      target[od] = {
        ...(target[od] ?? {}),
        hasNestedChanges: true,
      };
      return;
    }
    obj = nextObj;
    obj[od] = {
      ...(obj[od] ?? {}),
      hasNestedChanges: true,
    };
  }

  return;
};

const removeLeadingSlash = (s: string) =>
  s.charAt(0) === '/' ? s.slice(1) : s;

export const getDiffSegments = (diff: string) =>
  removeLeadingSlash(diff).split('/').map(jsonPointerHelpers.unescape);

export const buildChangelogTree = <T extends object>(
  before: object,
  after: T,
  diffs: ObjectDiff[]
): ChangelogTree<T> => {
  const changelogTree = cloneDeep(after);

  for (const diff of diffs) {
    // Removed
    if (diff.before !== undefined && diff.after === undefined) {
      const afterPath = getDiffSegments(reconcileDiff(diff).before!);
      const beforePath = getDiffSegments(diff.before);

      setInDiff(changelogTree, afterPath, {
        type: 'removed',
        before: getIn(before, beforePath),
      });
    }

    // Added
    else if (diff.before === undefined && diff.after !== undefined) {
      const afterPath = getDiffSegments(diff.after);

      setInDiff(changelogTree, afterPath, {
        type: 'added',
      });
    }

    // Changed
    else if (diff.before !== undefined && diff.after !== undefined) {
      const afterPath = getDiffSegments(diff.after);
      const beforePath = getDiffSegments(diff.before);

      setInDiff(changelogTree, afterPath, {
        type: 'changed',
        before: getIn(before, beforePath),
      });
    }
  }

  return changelogTree;
};
