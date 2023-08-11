import {
  UndocumentedOperation,
  UndocumentedOperationType,
} from '../../../operations';
import { SpecPatch } from '../..';
import { createMissingPathPatches } from '../../../../capture/patches/patchers/spec';

export function* missingPathPatches(
  undocumentedOperation: UndocumentedOperation
): IterableIterator<SpecPatch> {
  if (undocumentedOperation.type !== UndocumentedOperationType.MissingPath)
    return;

  yield createMissingPathPatches(undocumentedOperation);
}
