import { JsonPath } from '@useoptic/openapi-io';
import { VisitType } from '.';
import { IObservedTypes, ObservableJsonTypes } from '../result';

export function* objectVisitor(
  visitType: VisitType,
  path: JsonPath,
  object: { [key: string]: any }
): IterableIterator<IObservedTypes> {
  if (visitType !== VisitType.Object) return;

  let propertiesSet = new Set(Object.keys(object));

  yield {
    path,
    propertySets: [propertiesSet],
    types: [ObservableJsonTypes.Object],
  };
}

export function* objectKeyVisitor(
  visitType: VisitType,
  path: JsonPath,
  objectKeys: string[]
): IterableIterator<IObservedTypes> {
  if (visitType !== VisitType.ObjectKeys) return;
}
