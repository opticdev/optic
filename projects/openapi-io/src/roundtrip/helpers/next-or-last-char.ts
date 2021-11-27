import invariant from 'ts-invariant';
import { lines } from './lines';

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

export function returnLineNumberPosition(
  contents: string,
  position: number
): number {
  return lines(contents.substring(0, position)).length - 1;
}

// @todo might be problematic on windows.
export function returnLineForPosition(contents: string, position: number) {
  let lineStartIndex = -1;
  let lineEndIndex = contents.length;

  try {
    lineStartIndex = findPreviousChar(contents, '\n', position);
  } catch (e) {}
  try {
    lineEndIndex = findNextChar(contents, '\n', position);
  } catch (e) {}

  return contents.substring(lineStartIndex + 1, lineEndIndex - 1);
}
