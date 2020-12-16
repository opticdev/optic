import { Actual, Expectation } from './shape-diff-dsl';
import { ICoreShapeKinds } from '../interfaces/interfaces';
import { code, ICopy } from '../interfaces/interpretors';
import { nameForCoreShapeKind, namerForOneOf } from './quick-namer';
import { setDifference, setUnion } from '../set-ops';
import { IShapeChange } from './spec-change-dsl';

export function targetKindSuggestion(
  useUnion: boolean,
  expected: Expectation,
  actual: Actual
): {
  shapeChange: IShapeChange;
  updatedShapeName: ICopy[];
  targetFinal: Set<ICoreShapeKinds>;
} {
  const targetCoreShapeKinds = useUnion
    ? expected.unionWithActual(actual)
    : Array.from(actual.observedCoreShapeKinds());

  const filtered = targetCoreShapeKinds.filter(
    (
      i // fields handle these on the outer layer
    ) =>
      i !== ICoreShapeKinds.OptionalKind && i !== ICoreShapeKinds.NullableKind
  );

  const previewName: ICopy[] = (() => {
    if (filtered.length === 0) return [code('Unknown')];
    if (filtered.length === 1) return [code(nameForCoreShapeKind(filtered[0]))];
    if (filtered.length > 1) return namerForOneOf(filtered);
  })();

  const add: Set<ICoreShapeKinds> = setDifference(
    new Set([...targetCoreShapeKinds]),
    expected.expectedShapes()
  );

  const remove: Set<ICoreShapeKinds> = setDifference(
    expected.expectedShapes(),
    new Set([...targetCoreShapeKinds])
  );

  const shapeChange = {
    add: add,
    remove: remove,
  };

  return {
    shapeChange,
    updatedShapeName: previewName,
    targetFinal: new Set([...targetCoreShapeKinds]),
  };
}
