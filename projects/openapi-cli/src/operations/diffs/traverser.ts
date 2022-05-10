import { CapturedInteraction } from '../../captures';
import { Operation } from '..';
import { OperationDiffResult } from './result';
import { visitRequestBody, visitResponses } from './visitors';

export class OperationDiffTraverser {
  private interaction?: CapturedInteraction;
  private operation?: Operation;

  traverse(interaction, operation) {
    this.interaction = interaction;
    this.operation = operation;
  }

  *results(): IterableIterator<OperationDiffResult> {
    if (!this.interaction || !this.operation) return;

    const { operation, interaction } = this;

    yield* visitRequestBody(interaction.request, operation.requestBody);

    yield* visitResponses(interaction.response, operation.responses);
  }
}
