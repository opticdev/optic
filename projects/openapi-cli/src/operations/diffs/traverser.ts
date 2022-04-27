import { CapturedInteraction } from '../../captures';
import { OperationDiffResult } from './result';

export class OperationDiffTraverser {
  private interaction?: CapturedInteraction;

  traverse(interaction: CapturedInteraction) {
    this.interaction = interaction;
  }

  *results(): IterableIterator<OperationDiffResult> {
    if (!this.interaction) return;

    // match path
    // match method
  }
}
