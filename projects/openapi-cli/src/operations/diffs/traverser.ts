import { CapturedInteraction } from '../../captures';
import { DocumentedInteraction, Operation } from '..';
import { OperationDiffResult } from './result';

export class OperationDiffTraverser {
  private interaction?: CapturedInteraction;
  private operation?: Operation;

  traverse(interaction, operation) {
    this.interaction = interaction;
    this.operation = operation;
  }

  *results(): IterableIterator<OperationDiffResult> {
    if (!this.interaction || !this.operation) return;

    // match interaction with
  }
}
