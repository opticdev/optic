import { Body } from '../body';
import { ShapeObservationResult } from './result';
import { BodyObservationsTraverser } from './traverser';

export function* observeBodyShape(
  body: Body
): IterableIterator<ShapeObservationResult> {
  let traverser = new BodyObservationsTraverser();
  traverser.traverse(body);
  yield* traverser.results();
}
