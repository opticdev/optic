import { SpecDiffResult } from '../result';

export interface OperationDiffVisitor<I, T, C> {
  (input: I, spec: T, context?: C): IterableIterator<SpecDiffResult>;
}

export { visitPath } from './path';
export { visitMethod } from './method';
