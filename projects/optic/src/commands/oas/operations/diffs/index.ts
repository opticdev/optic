import { OpenAPIV3 } from '../../specs';
import { OperationDiffResult } from '../../../capture/patches/patchers/spec/types';
import { SpecOperationDiffTraverser } from './traversers';
import { FlatOpenAPIV3, FlatOpenAPIV3_1 } from '@useoptic/openapi-utilities';

export function* diffOperationWithSpec(
  operation: {
    pathPattern: string;
    methods: OpenAPIV3.HttpMethods[];
  },
  spec: FlatOpenAPIV3.Document | FlatOpenAPIV3_1.Document
): IterableIterator<OperationDiffResult> {
  const traverser = new SpecOperationDiffTraverser();
  traverser.traverse(operation, spec);
  yield* traverser.results();
}
