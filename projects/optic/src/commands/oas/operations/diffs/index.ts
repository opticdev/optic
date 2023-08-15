import { OpenAPIV3 } from '../../specs';
import {
  OperationDiffResult,
  OperationDiffResultKind,
} from '../../../capture/patches/patchers/spec/types';
import { SpecOperationDiffTraverser } from './traversers';

export type { OperationDiffResult };
export { OperationDiffResultKind };

export function* diffOperationWithSpec(
  operation: {
    pathPattern: string;
    methods: OpenAPIV3.HttpMethods[];
  },
  spec: OpenAPIV3.Document
): IterableIterator<OperationDiffResult> {
  const traverser = new SpecOperationDiffTraverser();
  traverser.traverse(operation, spec);
  yield* traverser.results();
}
