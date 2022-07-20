import { IChange } from '../openapi3/sdk/types';

/**
 * Sort changes by conceptual path, lexicographically, ancestors first
 */
export function compareChangesByPath(
  changeA: IChange,
  changeB: IChange
): number {
  const pathA = changeA.location.conceptualPath;
  const pathB = changeB.location.conceptualPath;

  for (let i = 0; i < Math.max(pathA.length, pathB.length); i++) {
    let a = pathA[i];
    let b = pathB[i];

    if (a === b) continue;
    if (!b) return 1;
    if (!a) return -1;
    if (a < b) return -1;
    if (a > b) return 1;
  }

  return pathB.length - pathA.length;
}
