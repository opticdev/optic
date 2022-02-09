import { ShapeDiffResult } from '../result';
import { ErrorObject } from '../traverser';

import { additionalProperties } from './additionalProperties';
import { oneOfKeyword } from './oneOf';
import { requiredKeyword } from './required';
import { typeKeyword } from './type';

export interface ShapeDiffVisitor {
  (
    validationError: ErrorObject,
    example: any
  ): IterableIterator<ShapeDiffResult>;
}

const visitors: ShapeDiffVisitor[] = [
  additionalProperties,
  oneOfKeyword,
  requiredKeyword,
  typeKeyword,
];

export function* diffVisitors(
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
  for (let visitor of visitors) {
    yield* visitor(validationError, example);
  }
}
