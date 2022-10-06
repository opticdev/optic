export interface Matcher<Kind, Context> {
  matchesName: string;
  predicate: (kind: Kind, context: Context) => boolean;
}

export function matches<Kind, Context>(
  matchesName: string,
  predicate: (kind: Kind, context: Context) => boolean
): Matcher<Kind, Context> {
  return { matchesName, predicate };
}
