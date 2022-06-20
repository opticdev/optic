const generateFileConfig = (filePath: string) => {
  return ` - id: ${filePath}
   path: ${filePath}`;
};

export const generateOpticConfig = (files: string[]): string => {
  const filesList = files.map(generateFileConfig).join(`\n`);
  return `files:
${filesList}
`;
};
