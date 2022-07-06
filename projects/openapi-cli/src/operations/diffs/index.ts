import { Operation } from '..';
import { CapturedInteraction } from '../../captures';
import { OperationDiffResult, OperationDiffResultKind } from './result';
import { OperationInteractionDiffTraverser } from './traversers';

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
