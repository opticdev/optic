import { ShapeDiffResult } from '../result';
import { ErrorObject } from '../../../../capture/patches/patchers/shapes/diff';

import { additionalProperties } from './additionalProperties';
import { oneOfKeyword } from './oneOf';
import { requiredKeyword } from './required';
import { typeKeyword } from './type';
import { enumKeyword } from './enum';

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
  enumKeyword,
];

export function* diffVisitors(
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
  for (let visitor of visitors) {
    yield* visitor(validationError, example);
  }
}
