import {
  UndocumentedOperation,
  UndocumentedOperationType,
} from '../../../operations';
import { SpecPatch } from '../..';
import { createMissingMethodPatch } from '../../../../capture/patches/patchers/spec';

export function* missingMethodPatches(
  undocumentedOperation: UndocumentedOperation
): IterableIterator<SpecPatch> {
  if (undocumentedOperation.type !== UndocumentedOperationType.MissingMethod)
    return;

  yield createMissingMethodPatch(undocumentedOperation);
}
