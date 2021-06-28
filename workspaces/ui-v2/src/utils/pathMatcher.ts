export const pathMatcher = (
  pathComponents: {
    part: string;
    isParameterized: boolean;
  }[]
): ((pathToMatch: string) => boolean) => {
  return (pathToMatch: string): boolean => {
    const partsToMatch = pathToMatch.split('/');
    if (partsToMatch.length !== pathComponents.length) {
      return false;
    }
    return pathComponents.every(({ part, isParameterized }, i) => {
      return isParameterized || part === partsToMatch[i];
    });
  };
};
