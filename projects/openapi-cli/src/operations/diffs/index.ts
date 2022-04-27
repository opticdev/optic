import { DocumentedInteraction } from '..';
import { OpenAPIV3 } from '../../specs';
import { OperationDiffResult } from './result';
import { OperationDiffTraverser } from './traverser';

export function* diffInteractionByOperation(
  interaction: DocumentedInteraction,
  schema: OpenAPIV3.Document
): IterableIterator<OperationDiffResult> {
  const traverser = new OperationDiffTraverser();
  traverser.traverse(interaction.interaction, interaction.operation);
  yield* traverser.results();
}
