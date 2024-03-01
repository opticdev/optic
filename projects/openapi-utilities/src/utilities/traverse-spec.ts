import { OpenAPITraverser } from '../openapi3/implementations/openapi3/openapi-traverser';
import { IFact } from '../openapi3/sdk/types';
import { FlatOpenAPIV3, FlatOpenAPIV3_1 } from '../flat-openapi-types';

export const traverseSpec = (
  spec: FlatOpenAPIV3.Document | FlatOpenAPIV3_1.Document
): IFact[] => {
  const traverser = new OpenAPITraverser();
  traverser.traverse(spec);
  return [...traverser.facts()];
};
