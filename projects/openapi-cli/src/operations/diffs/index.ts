import { CapturedInteraction } from '../../captures';
import { OpenAPIV3 } from '../../specs';
import { OperationDiffResult } from './result';
import { OperationDiffTraverser } from './traverser';

export function* diffInteractionBySpec(
  interaction: CapturedInteraction,
  schema: OpenAPIV3.Document
): IterableIterator<OperationDiffResult> {
  const traverser = new OperationDiffTraverser();
  traverser.traverse(interaction);
  yield* traverser.results();
}
