export function diffCollectionByComputedIndex<T>(
  idGenerator: (item: T) => string,
  before: T[],
  after: T[]
) {
  const beforeIndexed: { [key: string]: T } = {};
  before.forEach((item) => (beforeIndexed[idGenerator(item)] = item));
  const beforeIds: Set<string> = new Set(Object.keys(beforeIndexed));

  const afterIndexed: { [key: string]: T } = {};
  after.forEach((item) => (afterIndexed[idGenerator(item)] = item));
  const afterIds: Set<string> = new Set(Object.keys(afterIndexed));

  const addedIds = () => [...afterIds].filter((key) => !beforeIds.has(key));
  const addedNodes: () => [string, T][] = () =>
    addedIds().map((id) => [id, afterIndexed[id]]);

  const removedIds = () => [...beforeIds].filter((key) => !afterIds.has(key));
  const removedNodes: () => [string, T][] = () =>
    removedIds().map((id) => [id, beforeIndexed[id]]);

  const continuousIds = () =>
    [...new Set<string>([...beforeIds, ...afterIds])].filter(
      (key) => afterIds.has(key) && beforeIds.has(key)
    );

  const continuousNodes: () => [string, T, T][] = () =>
    continuousIds().map((id) => [id, beforeIndexed[id], afterIndexed[id]]);

  return {
    addedIds,
    addedNodes,
    removedIds,
    removedNodes,
    continuousIds,
    continuousNodes,
  };
}
