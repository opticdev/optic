import { JsonPath } from '@useoptic/openapi-io';
import { ObservedTypes, ShapeObservationResult } from './result';
import { Body } from '../body';

export class BodyObservationsTraverser {
  private body?: Body;

  traverse(body: Body) {
    this.body = body;
  }

  *results(): IterableIterator<ShapeObservationResult> {
    if (!this.body) return;

    let observedTypes = this.traverseRoot(this.body.value);
  }

  private *traverseRoot(rootValue: any): IterableIterator<ObservedTypes> {
    let path = '/';
    yield* this.traverseValue(rootValue, path);
  }

  private *traverseValue(
    bodyValue: any,
    path: JsonPath
  ): IterableIterator<ObservedTypes> {
    if (typeof bodyValue === 'undefined') return;

    if (typeof bodyValue === 'object' && Array.isArray(bodyValue)) {
      // arrays
    } else if (typeof bodyValue === 'object') {
      // objects
    } else {
      // primitive types
    }
  }
}
