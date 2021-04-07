export function setEquals<T>(as: Set<T>, bs: Set<T>): boolean {
  if (as.size !== bs.size) return false;
  for (var a of as) if (!bs.has(a)) return false;
  return true;
}

export const setDifference = <T>(a: Set<T>, b: Set<T>) =>
  new Set<T>([...a].filter((x) => !b.has(x)));
export const setIntersection = <T>(a: Set<T>, b: Set<T>) =>
  new Set<T>([...a].filter((x) => b.has(x)));
export const setUnion = <T>(a: Set<T>, b: Set<T>) => new Set<T>([...a, ...b]);
