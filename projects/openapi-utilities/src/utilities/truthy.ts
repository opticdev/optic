export const isTruthyStringValue = (value: string): boolean => {
  const lowerCase = value.toLowerCase();

  return (
    lowerCase === 'true' ||
    lowerCase === '1' ||
    lowerCase === 'yes' ||
    lowerCase === 'y' ||
    lowerCase === 'on'
  );
};
