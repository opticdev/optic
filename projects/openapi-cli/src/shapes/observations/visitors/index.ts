import { JsonPath } from '@useoptic/openapi-io';
import { IObservedTypes, ObservedTypes } from '../result';
import { BodyObservationsTraverser } from '../traverser';

import { arrayVisitor } from './array';
import { objectVisitor, objectKeyVisitor } from './object';
import { primitiveVisitor } from './primitive';

export enum VisitType {
  Object = 'object',
  ObjectKeys = 'objectKeys',
  Array = 'array',
  Primitive = 'primitive',
}

export type BodyObservationsVisitor =
  | ArrayVisitor
  | BodyVisitor
  | BodyKeysVisitor
  | PrimitiveVisitor;

export function* observationVisitors(
  type: VisitType,
  path: JsonPath,
  value: any
): IterableIterator<IObservedTypes> {
  for (let visitor of visitors) {
    yield* visitor(type, path, value);
  }
}

interface ArrayVisitor {
  (
    type: VisitType,
    path: JsonPath,
    value: any[]
  ): IterableIterator<IObservedTypes>;
}
interface BodyVisitor {
  (
    type: VisitType,
    path: JsonPath,
    value: { [key: string]: any }
  ): IterableIterator<IObservedTypes>;
}

interface BodyKeysVisitor {
  (
    type: VisitType,
    path: JsonPath,
    value: string[]
  ): IterableIterator<IObservedTypes>;
}

interface PrimitiveVisitor {
  (
    type: VisitType,
    path: JsonPath,
    value: boolean | null | number | string
  ): IterableIterator<IObservedTypes>;
}

const visitors: BodyObservationsVisitor[] = [
  arrayVisitor,
  objectVisitor,
  objectKeyVisitor,
  primitiveVisitor,
];
