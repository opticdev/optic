import {
  UndocumentedOperation,
  UndocumentedOperationType,
} from '../../../operations';
import { createMissingMethodPatch } from '../../../../capture/patches/patchers/spec/spec';
import { SpecPatch } from '../../../../capture/patches/patchers/spec/patches';

export function* missingMethodPatches(
  undocumentedOperation: UndocumentedOperation
): IterableIterator<SpecPatch> {
  if (undocumentedOperation.type !== UndocumentedOperationType.MissingMethod)
    return;

  yield createMissingMethodPatch(undocumentedOperation);
}
