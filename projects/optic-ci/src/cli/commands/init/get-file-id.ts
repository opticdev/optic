import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export const getFileId = (spec: OpenAPIV3.Document) => {
  const hash = Math.floor(Math.random() * 100_000);
  const title = (spec.info.title || 'openapi').replace(/\ /g, '-');
  return `${title}-${hash}`;
};
