import { Body } from '../body';
import { IShapeObservationResult } from './result';
import { BodyObservationsTraverser } from './traverser';

export function* observeBodyShape(
  body: Body
): IterableIterator<IShapeObservationResult> {
  let traverser = new BodyObservationsTraverser();
  traverser.traverse(body);
  yield* traverser.results();
}
