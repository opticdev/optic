import { JsonPath } from '@useoptic/openapi-io';
import {
  IObservedTypes,
  ObservedTypes,
  ShapeObservationResult,
} from './result';
import { Body } from '../body';
import { observationVisitors, VisitType } from './visitors';

export class BodyObservationsTraverser {
  private body?: Body;

  traverse(body: Body) {
    this.body = body;
  }

  // emits every intermediate result state, to allow control over compute by consumer
  *results(): IterableIterator<ShapeObservationResult> {
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
    let path = '/';
    yield* this.traverseValue(rootValue, path);
  }

  private *traverseValue(
    bodyValue: any,
    path: JsonPath
  ): IterableIterator<IObservedTypes> {
    if (typeof bodyValue === 'undefined') return;

    if (typeof bodyValue === 'object' && Array.isArray(bodyValue)) {
    } else if (typeof bodyValue === 'object') {
      // objects
    } else {
      // primitive types
      yield* observationVisitors(VisitType.Primitive, path, bodyValue);
    }
  }
}
