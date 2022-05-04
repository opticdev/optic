import { Operation } from '..';
import { CapturedInteraction } from '../../captures';
import { OperationDiffResult, OperationDiffResultKind } from './result';
import { OperationDiffTraverser } from './traverser';

export type { OperationDiffResult };
export { OperationDiffResultKind };

export function* diffInteractionByOperation(
  interaction: CapturedInteraction,
  operation: Operation
): IterableIterator<OperationDiffResult> {
  const traverser = new OperationDiffTraverser();
  traverser.traverse(interaction, operation);
  yield* traverser.results();
}
