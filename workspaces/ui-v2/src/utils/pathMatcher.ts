export type PathComponentAuthoring = {
  index: number;
  name: string;
  originalName: string;
  isParameter: boolean;
};

export function urlStringToPathComponents(
  url: string
): PathComponentAuthoring[] {
  const components: PathComponentAuthoring[] = url
    .split('/')
    .map((name, index) => {
      return { index, name, originalName: name, isParameter: false };
    });
  const [root, ...rest] = components;
  if (root.name === '') {
    return rest;
  }
  return components;
}

export const createPathFromPathComponents = (
  components: PathComponentAuthoring[]
) => {
  return (
    '/' +
    components
      .map((i) => {
        return i.isParameter ? `{${i.name}}` : i.originalName;
      })
      .join('/')
  );
};

export const pathMatcher = (
  pathComponents: PathComponentAuthoring[]
): ((pathToMatch: string) => boolean) => {
  return (pathToMatch: string): boolean => {
    const partsToMatch = urlStringToPathComponents(pathToMatch);
    if (partsToMatch.length !== pathComponents.length) {
      return false;
    }
    return pathComponents.every(({ name, isParameter }, i) => {
      return isParameter || name === partsToMatch[i].name;
    });
  };
};
