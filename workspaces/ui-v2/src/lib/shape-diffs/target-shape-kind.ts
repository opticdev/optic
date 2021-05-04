import { ICoreShapeKinds } from '../Interfaces';
import { Actual, Expectation } from '../shape-diff-dsl-rust';
import { code, ICopy } from '../../optic-components/diffs/render/ICopyRender';
import { nameForCoreShapeKind, namerForOneOf } from '../quick-namer';
import { setDifference } from '../set-ops';

export interface IShapeChange {
  add: Set<ICoreShapeKinds>;
  remove: Set<ICoreShapeKinds>;
  wrapNullable: boolean;
}

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
  })()!;

  const add: Set<ICoreShapeKinds> = setDifference(
    new Set([...targetCoreShapeKinds]),
    expected.expectedShapes()
  );

  const remove: Set<ICoreShapeKinds> = setDifference(
    expected.expectedShapes(),
    new Set([...targetCoreShapeKinds])
  );

  const targetFinal = new Set([...targetCoreShapeKinds]);
  const shapeChange = {
    add: add,
    remove: remove,
    wrapNullable: targetFinal.has(ICoreShapeKinds.NullableKind),
  };

  return {
    shapeChange,
    updatedShapeName: previewName,
    targetFinal,
  };
}
