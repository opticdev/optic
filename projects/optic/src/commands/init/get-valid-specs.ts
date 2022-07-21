import { parseOpenApiSpec } from './parse-openapi-spec';
import { readOpenApiSpec } from './read-openapi-spec';
import { SpecWithPath } from './types';

export const getValidSpecs = async (filePaths: string[]) => {
  const validSpecs: SpecWithPath[] = [];
  for await (const filePath of filePaths) {
    const fileString = await readOpenApiSpec(filePath);
    const specType = filePath.match(/\.json$/) ? 'json' : 'yml';
    const parsedResult = parseOpenApiSpec(fileString, specType);
    if (parsedResult.ok) {
      const specWithPath = { path: filePath, spec: parsedResult.result };
      validSpecs.push(specWithPath);
    }
  }
  return validSpecs;
};
