function isPattern(part: string) {
  return part.startsWith('{') && part.endsWith('}');
}

export function matchPathPattern(
  pathPattern: string,
  path: string
): { match: true; exact: boolean } | { match: false } {
  const patternParts = pathPattern.split('/');
  const pathParts = path.split('/');
  if (patternParts.length !== pathParts.length) {
    return { match: false };
  }

  for (let i = 0; i < patternParts.length; i++) {
    const pathPart = pathParts[i];
    const patternPart = patternParts[i];
    if (!isPattern(patternPart) && pathPart !== patternPart) {
      return { match: false };
    }
  }

  return {
    match: true,
    exact: patternParts.every((part) => !isPattern(part)),
  };
}
