export const generateOpticConfig = (files: string[]): string => {
  const filesList = files.map((f) => ` - ${f}`).join(`\n`);
  return `spec-files:
${filesList}
`;
};
