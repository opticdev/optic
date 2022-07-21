import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export type SpecWithPath = {
  path: string;
  spec: OpenAPIV3.Document;
};
