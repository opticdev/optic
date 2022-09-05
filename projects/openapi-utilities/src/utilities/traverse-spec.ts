import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { OpenAPI3Traverser } from '../openapi/openapi3/openapi-3-traverser';
import { IFact } from '../openapi/sdk/types';
import { checkOpenAPIVersion } from '../openapi/openapi-versions';
import { OpenAPI2Traverser } from '../openapi/openapi2/openapi-2-traverser';

export const traverseSpec = (jsonSpec: OpenAPI.Document): IFact[] => {

  const version = checkOpenAPIVersion(jsonSpec)

  switch (version) {
    case '3.0.x':
    case '3.1.x':
      const traverser = new OpenAPI3Traverser();
      traverser.traverse(jsonSpec as OpenAPIV3.Document);
      return [...traverser.facts()];
    case '2.0.x':
      const currentTraverser = new OpenAPI2Traverser();
      currentTraverser.traverse(jsonSpec as OpenAPIV2.Document);
      return [...currentTraverser.facts()];
  }

};
