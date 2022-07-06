import { OpenAPIV3 } from '..';
import { CapturedInteraction } from '../../captures';
import { SpecDiffResult, SpecDiffResultKind } from './result';
import { SpecDiffTraverser } from './traverser';

export type { SpecDiffResult };
export { SpecDiffResultKind };

export function* diffOperationWithSpec(
  operation: {
    pathPattern: string;
    methods: OpenAPIV3.HttpMethods[];
  },
  spec: OpenAPIV3.Document
): IterableIterator<SpecDiffResult> {
  const traverser = new SpecDiffTraverser();
  traverser.traverse(operation, spec);
  yield* traverser.results();
}
