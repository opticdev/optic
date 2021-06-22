export function findLongestCommonPath(paths: string[][]): string {
  if (paths.length === 0) return '/';
  let match: string[] = [];
  // sorted paths by lengths ascending
  const sortedPaths = paths
    .concat()
    .sort((a, b) => (a.length - b.length > 0 ? 1 : -1));
  const shortestPath = sortedPaths[0];
  const otherPaths = sortedPaths.slice(1);

  for (let i = 0; i < shortestPath.length; i++) {
    if (!otherPaths.every((path) => path[i] === shortestPath[i])) {
      break;
    }

    match.push(shortestPath[i]);
  }

  return match.join('/');
}
