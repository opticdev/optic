import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export const getFileId = (spec: OpenAPIV3.Document, fileName: string) => {
  const hash = Math.floor(Math.random() * 100_000);
  const title = (spec.info.title || fileName).replace(/\s/g, '-');
  return `${title}-${hash}`;
};
