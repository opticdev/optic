export function findLongestStartingSubstring(array: string[]): string {
  if (array.length === 0) return '';
  // alphanumeric sort to be able to compare the first and last item
  const sortedArray = array.concat().sort();
  const a1 = sortedArray[0];
  const a2 = sortedArray[sortedArray.length - 1];

  for (let i = 0; i < a1.length; i++) {
    if (a1.charAt(i) !== a2.charAt(i)) {
      return a1.substring(0, i);
    }
  }
  return a1;
}
