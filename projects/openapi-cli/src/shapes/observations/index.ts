import { Body } from '../body';
import { ShapeObservationResult } from './result';

export function* observeBodyShape(
  body: Body
): IterableIterator<ShapeObservationResult> {}
