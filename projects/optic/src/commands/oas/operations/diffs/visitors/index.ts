import { OperationDiffResult } from '../../../../capture/patches/patchers/spec/types';

export interface OperationDiffVisitor<I, T, C> {
  (interaction: I, spec: T, context?: C): IterableIterator<OperationDiffResult>;
}

export { visitPath } from './path';
export { visitMethod } from '../../../operations/diffs/visitors/method';
