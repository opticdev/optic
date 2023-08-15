import {
  UndocumentedOperation,
  UndocumentedOperationType,
} from '../../../operations';
import { createMissingPathPatches } from '../../../../capture/patches/patchers/spec/spec';
import { SpecPatch } from '../../../../capture/patches/patchers/spec/patches';

export function* missingPathPatches(
  undocumentedOperation: UndocumentedOperation
): IterableIterator<SpecPatch> {
  if (undocumentedOperation.type !== UndocumentedOperationType.MissingPath)
    return;

  yield createMissingPathPatches(undocumentedOperation);
}
