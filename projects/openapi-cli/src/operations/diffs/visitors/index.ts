import { CapturedInteraction } from '../../../captures';
import { OperationDiffResult } from '../result';

export interface OperationDiffVisitor<T> {
  (
    interaction: CapturedInteraction,
    spec: T
  ): IterableIterator<OperationDiffResult>;
}

export { visitRequestBody } from './request-body';
export { visitResponses } from './responses';
