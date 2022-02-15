import { JsonPath } from '@useoptic/openapi-io';
import { VisitType } from '.';
import { IObservedTypes, ObservableJsonTypes } from '../result';

export function* primitiveVisitor(
  visitType: VisitType,
  path: JsonPath,
  primitive: boolean | number | null | string
): IterableIterator<IObservedTypes> {
  if (visitType !== VisitType.Primitive) return;

  let types: ObservableJsonTypes[] = [];
  if (typeof primitive === 'boolean') {
    types.push(ObservableJsonTypes.Boolean);
  } else if (typeof primitive === 'number') {
    types.push(ObservableJsonTypes.Number);
  } else if (primitive === null) {
    types.push(ObservableJsonTypes.Null);
  } else if (typeof primitive === 'string') {
    types.push(ObservableJsonTypes.String);
  } else {
    console.warn(
      'primitive visitor visiting unknown primitive type',
      typeof primitive
    );
  }

  yield {
    path,
    propertySets: [],
    types,
  };
}
