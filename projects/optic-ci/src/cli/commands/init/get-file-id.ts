import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { v4 as uuid } from 'uuid';

export const getFileId = (spec: OpenAPIV3.Document, fileName: string) => {
  const hash = uuid().slice(0, 5);
  const title = (spec.info.title || fileName).replace(/\s/g, '-');
  return `${title}-${hash}`;
};
