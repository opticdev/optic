import {
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from '@useoptic/openapi-io';

export type ValidSpec = {
  path: string;
  title: string | undefined;
};

export const getValidSpecs = async (filePaths: string[]) => {
  const validSpecs: ValidSpec[] = [];
  for await (const filePath of filePaths) {
    let spec: ParseOpenAPIResult;
    try {
      const spec = await parseOpenAPIWithSourcemap(filePath);
      const specWithPath = { path: filePath, title: spec.jsonLike.info?.title };
      validSpecs.push(specWithPath);
    } catch (e) {
      // just ignore errors
    }
  }
  return validSpecs;
};
