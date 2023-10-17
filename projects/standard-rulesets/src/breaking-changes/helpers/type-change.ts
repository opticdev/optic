export function computeEffectiveTypeChange(
  beforeType: string | string[],
  afterType: string | string[]
): {
  expanded: boolean;
  narrowed: boolean;
  identical: boolean;
} {
  const results = {
    expanded: false,
    narrowed: false,
    identical: true,
  };
  const before = typeToSet(beforeType);
  const after = typeToSet(afterType);

  // Check for identical sets
  if (before.size !== after.size) results.identical = false;
  for (const a of before) {
    if (!after.has(a)) {
      results.identical = false;
      results.narrowed = true;
    }
  }
  for (const a of after) {
    if (!before.has(a)) {
      results.identical = false;
      results.expanded = true;
    }
  }

  return results;
}

function typeToSet(type: string | string[]): Set<string> {
  if (Array.isArray(type)) {
    return new Set(type);
  } else if (typeof type === 'string') {
    return new Set([type]);
  } else {
    return new Set([]);
  }
}
