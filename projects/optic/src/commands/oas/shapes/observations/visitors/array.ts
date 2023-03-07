import { JsonPath } from '@useoptic/openapi-io';
import { VisitType } from '.';
import { IObservedTypes, ObservableJsonTypes } from '../result';

export function* arrayVisitor(
  visitType: VisitType,
  path: JsonPath,
  array: any[]
): IterableIterator<IObservedTypes> {
  if (visitType !== VisitType.Array) return;

  let types = [ObservableJsonTypes.Array];
  if (array.length === 0) types.push(ObservableJsonTypes.EmptyArray);

  yield {
    path,
    propertySets: [],
    types,
  };
}
