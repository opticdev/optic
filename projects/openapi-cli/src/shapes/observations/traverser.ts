import { JsonPath } from '@useoptic/openapi-io';
import {
  IObservedTypes,
  ObservedTypes,
  IShapeObservationResult,
  ShapeObservationResult,
} from './result';
import { Body } from '../body';
import { observationVisitors, VisitType } from './visitors';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export class BodyObservationsTraverser {
  private body?: Body;

  traverse(body: Body) {
    this.body = body;
  }

  // emits every intermediate result state, to allow control over compute by consumer
  *results(): IterableIterator<IShapeObservationResult> {
    if (!this.body) return;
    let observedTypes = this.traverseRoot(this.body.value);
    let currentResult = ShapeObservationResult.create();

    for (let observedType of observedTypes) {
      currentResult = ShapeObservationResult.observe(
        currentResult,
        observedType
      );

      yield currentResult;
    }
  }

  private *traverseRoot(rootValue: any): IterableIterator<IObservedTypes> {
    let path = '';
    yield* this.traverseValue(rootValue, path);
  }

  private *traverseValue(
    bodyValue: any,
    path: JsonPath
  ): IterableIterator<IObservedTypes> {
    if (typeof bodyValue === 'undefined') return;

    if (Array.isArray(bodyValue)) {
      yield* observationVisitors(VisitType.Array, path, bodyValue);

      for (let [index, item] of bodyValue.entries()) {
        let itemPath = jsonPointerHelpers.append(path, '0');
        yield* this.traverseValue(item, itemPath);
      }
    } else if (typeof bodyValue === 'object') {
      // objects
      yield* observationVisitors(VisitType.Object, path, bodyValue);
      yield* observationVisitors(VisitType.ObjectKeys, path, [
        ...Object.keys(bodyValue),
      ]);

      for (let [key, fieldValue] of Object.entries(bodyValue)) {
        let fieldPath = jsonPointerHelpers.append(path, key);
        yield* this.traverseValue(fieldValue, fieldPath);
      }
    } else {
      // primitive types
      yield* observationVisitors(VisitType.Primitive, path, bodyValue);
    }
  }
}
