import { OpenAPIV3, SpecPatch } from '../..';
import { UndocumentedOperation } from '../../../operations';
import { missingMethodPatches } from './missing-method';
import { missingPathPatches } from './missing-path';

export { newSpecPatches } from './new-spec';

export interface UndocumentedOperationPatchGenerator {
  (undocumentedOperation: UndocumentedOperation);
}

const undocumentedOperationPatchGenerators: UndocumentedOperationPatchGenerator[] =
  [missingMethodPatches, missingPathPatches];

export function* undocumentedOperationPatches(
  undocumentedOperation: UndocumentedOperation
): IterableIterator<SpecPatch> {
  for (let generator of undocumentedOperationPatchGenerators) {
    yield* generator(undocumentedOperation);
  }
}
