import { OpenAPIV3 } from 'openapi-types';
import { OpenAPITraverser } from '../openapi3/implementations/openapi3/openapi-traverser';
import { IFact } from '../openapi3/sdk/types';

export const traverseSpec = (spec: OpenAPIV3.Document): IFact[] => {
  const traverser = new OpenAPITraverser();
  traverser.traverse(spec);
  return [...traverser.facts()];
};
