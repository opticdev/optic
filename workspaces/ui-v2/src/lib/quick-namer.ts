import sortby from 'lodash.sortby';
import {
  code,
  ICopy,
  plain,
} from '../optic-components/diffs/render/ICopyRender';
import { ICoreShapeKinds } from './Interfaces';

export function namer(kinds: ICoreShapeKinds[]): string {
  const kindsFiltered = kinds.filter(
    (i) =>
      ![ICoreShapeKinds.NullableKind, ICoreShapeKinds.OptionalKind].includes(i),
  );

  const result = (() => {
    if (kindsFiltered.length === 0) {
      return 'Unknown';
    } else if (kindsFiltered.length === 1) {
      return nameForCoreShapeKind(kindsFiltered[0]);
    } else {
      return namerForOneOf(kindsFiltered)
        .map((i) => i.text)
        .join(' ');
    }
  })();

  return `${result}${
    kinds.includes(ICoreShapeKinds.OptionalKind) ? ' (optional)' : ''
  }${kinds.includes(ICoreShapeKinds.NullableKind) ? ' (nullable)' : ''}`;
}

export function namerForOptions(kinds: ICoreShapeKinds[]): string {
  const kindsFiltered = kinds.filter(
    (i) =>
      ![ICoreShapeKinds.NullableKind, ICoreShapeKinds.OptionalKind].includes(i),
  );

  return (() => {
    if (kinds.includes(ICoreShapeKinds.NullableKind)) {
      return 'Null';
    } else if (kindsFiltered.length === 0) {
      return 'Unknown';
    } else if (kindsFiltered.length === 1) {
      return nameForCoreShapeKind(kindsFiltered[0]);
    } else {
      return namerForOneOf(kindsFiltered)
        .map((i) => i.text)
        .join(' ');
    }
  })();
}

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
      array: ICoreShapeKinds[],
    ) => [
      ...before,
      plain(before.length ? (i < array.length - 1 ? ',' : 'or') : ''),
      code(nameForCoreShapeKind(value)),
    ],
    [],
  );
}
