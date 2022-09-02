import { OpenAPIV3 } from 'openapi-types';
import { OpenAPI3Traverser } from '../openapi/openapi3/openapi-3-traverser';
import { IFact } from '../openapi/sdk/types';

export const traverseSpec = (spec: OpenAPIV3.Document): IFact[] => {
  const traverser = new OpenAPI3Traverser();
  traverser.traverse(spec);
  return [...traverser.facts()];
};
