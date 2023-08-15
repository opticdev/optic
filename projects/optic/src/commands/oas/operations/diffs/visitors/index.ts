import { OperationDiffResult } from '../result';

export interface OperationDiffVisitor<I, T, C> {
  (interaction: I, spec: T, context?: C): IterableIterator<OperationDiffResult>;
}

export { visitPath } from './path';
export { visitMethod } from '../../../operations/diffs/visitors/method';
