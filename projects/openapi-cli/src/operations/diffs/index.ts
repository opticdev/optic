import { Operation } from '..';
import { OpenAPIV3 } from '../../specs';
import { CapturedInteraction } from '../../captures';
import { OperationDiffResult, OperationDiffResultKind } from './result';
import {
  OperationInteractionDiffTraverser,
  SpecOperationDiffTraverser,
} from './traversers';

export type { OperationDiffResult };
export { OperationDiffResultKind };

export function* diffInteractionByOperation(
  interaction: CapturedInteraction,
  operation: Operation
): IterableIterator<OperationDiffResult> {
  const traverser = new OperationInteractionDiffTraverser();
  traverser.traverse(interaction, operation);
  yield* traverser.results();
}

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
