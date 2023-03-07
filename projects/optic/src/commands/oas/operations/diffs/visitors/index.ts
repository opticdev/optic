import { OperationDiffResult } from '../result';

export interface OperationDiffVisitor<I, T, C> {
  (interaction: I, spec: T, context?: C): IterableIterator<OperationDiffResult>;
}

export { visitRequestBody } from './request-body';
export { visitResponses } from './responses';
export { visitPath } from './path';
export { visitMethod } from '../../../operations/diffs/visitors/method';
