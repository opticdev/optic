import invariant from 'ts-invariant';

export function findNextChar(
  contents: string,
  char: string,
  after: number
): number {
  const found = contents.substring(after).indexOf(char);
  invariant(found !== -1, `expected to find '${char}' after position ${after}`);
  return found + after + 1;
}

export function findPreviousChar(
  contents: string,
  char: string,
  before: number
): number {
  const beforeString = contents.substring(0, before);
  const found = beforeString.lastIndexOf(char);

  invariant(
    found !== -1,
    `expected to find '${char}' before position ${before}`
  );

  return found;
}
