import { Operation } from '../..';
import { OperationPatch } from '..';
import { OperationDiffResult } from '../../diffs';

import { requestBodyPatches } from './request-body';
import { responsesPatches } from './responses';

export interface DiffOperationPatchGenerator {
  (
    diff: OperationDiffResult,
    operation: Operation,
    context?: {
      statusCode: string;
    }
  ): IterableIterator<OperationPatch>;
}

export const diffOperationPatchGenerators: DiffOperationPatchGenerator[] = [
  requestBodyPatches,
  responsesPatches,
];
