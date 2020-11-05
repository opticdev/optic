import { ICoreShapeKinds } from '../interfaces/interfaces';
import sortby from 'lodash.sortby';
import { code, ICopy, plain } from '../interfaces/interpretors';
export function nameForCoreShapeKind(kind: ICoreShapeKinds): string {
  switch (kind) {
    case ICoreShapeKinds.ObjectKind:
      return 'Object';
    case ICoreShapeKinds.ListKind:
      return 'List';
    case ICoreShapeKinds.AnyKind:
      return 'Any';
    case ICoreShapeKinds.StringKind:
      return 'String';
    case ICoreShapeKinds.NumberKind:
      return 'Number';
    case ICoreShapeKinds.BooleanKind:
      return 'Boolean';
    case ICoreShapeKinds.UnknownKind:
      return 'Unknown';
    default:
      return kind.toString();
  }
}

export function namerForOneOf(kinds: ICoreShapeKinds[]): ICopy[] {
  return sortby(kinds).reduce(
    (
      before: ICopy[],
      value: ICoreShapeKinds,
      i: number,
      array: ICoreShapeKinds[]
    ) => [
      ...before,
      plain(before.length ? (i < array.length - 1 ? ',' : 'or') : ''),
      code(nameForCoreShapeKind(value)),
    ],
    []
  );
}
