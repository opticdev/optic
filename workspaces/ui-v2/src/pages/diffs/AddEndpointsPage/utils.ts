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

export const makePattern = (components: PathComponentAuthoring[]) => {
  return (
    '/' +
    components
      .map((i) => {
        return i.isParameter ? `:${i.name}` : i.originalName;
      })
      .join('/')
  );
};
