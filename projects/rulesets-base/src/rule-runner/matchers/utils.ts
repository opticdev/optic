export class Matcher {
  public type: 'matcher';
  constructor(
    private matcher: (value: any) => boolean,
    private name?: string
  ) {
    this.type = 'matcher';
  }

  match(value: any): boolean {
    return this.matcher(value);
  }

  toString() {
    return this.name ? `Matcher.${this.name}` : 'CustomMatcher';
  }

  toJSON() {
    return this.toString();
  }

  static isInstance(v: any): v is Matcher {
    return v?.type === 'matcher';
  }
}

export const Matchers = {
  string: new Matcher((value) => typeof value === 'string', 'string'),
  boolean: new Matcher((value) => typeof value === 'boolean', 'boolean'),
  number: new Matcher((value) => typeof value === 'number', 'number'),
};

function setEquals<T>(as: Set<T>, bs: Set<T>): boolean {
  if (as.size !== bs.size) return false;
  for (var a of as) if (!bs.has(a)) return false;
  return true;
}

const arraysMatcher = (
  reference: any[],
  arrayToMatch: any[],
  strict: boolean
): boolean => {
  if (strict && reference.length !== arrayToMatch.length) {
    return false;
  }

  // pointer from reference array index to an array of matching arrayToMatch indices
  const referenceMatchResults = new Map<number, number[]>(
    reference.map((_, i) => [i, []])
  );

  // find all the matched indices for each reference index
  for (let i = 0; i < reference.length; i++) {
    // reference array
    const referenceValue = reference[i];
    const matchedIndicesArray = referenceMatchResults.get(i)!;
    for (let j = 0; j < arrayToMatch.length; j++) {
      if (valuesMatcher(referenceValue, arrayToMatch[j], strict)) {
        matchedIndicesArray.push(j);
      }
    }
  }

  return [...referenceMatchResults.values()].every(
    (matchedIndices) => matchedIndices.length > 0
  );
};

// matches an object against a reference
// strict === true means we do an exact match, otherwise a partial match is done
export const valuesMatcher = (
  reference: any,
  objectToMatch: any,
  strict: boolean = false
): boolean => {
  // handle null / array
  if (Matcher.isInstance(reference)) {
    return reference.match(objectToMatch);
  } else if (reference === null || typeof reference !== 'object') {
    return reference === objectToMatch;
  } else if (Array.isArray(reference)) {
    return (
      Array.isArray(objectToMatch) &&
      arraysMatcher(reference, objectToMatch, strict)
    );
  } else {
    if (
      objectToMatch === null ||
      typeof objectToMatch !== 'object' ||
      Array.isArray(objectToMatch)
    ) {
      return false;
    }

    for (const [key, referenceValue] of Object.entries(reference)) {
      if (!valuesMatcher(referenceValue, objectToMatch[key], strict)) {
        return false;
      }
    }

    if (strict) {
      const referenceKeys = new Set(Object.keys(reference));
      const matchKeys = new Set(Object.keys(objectToMatch));
      return setEquals(referenceKeys, matchKeys);
    }
  }

  return true;
};
