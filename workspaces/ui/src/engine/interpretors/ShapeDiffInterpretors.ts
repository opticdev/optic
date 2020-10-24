import { BodyShapeDiff, ParsedDiff } from '../parse-diff';
import { IChangeType, ISuggestion, plain } from '../interfaces/interpretors';
import invariant from 'invariant';
import {
  DiffTypes,
  IUnmatchedRequestBodyShape,
  IUnmatchedResponseBodyContentType,
} from '../interfaces/diffs';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounter,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { DiffRfcBaseState } from '../interfaces/diff-rfc-base-state';
import {
  Actual,
  Expectation,
  ShapeInterpretationHelper,
} from './shape-diff-dsl';
import { fieldShapeDiffInterpretor } from './interpretor-types/field';

//only ever take 1 diff at a time
export function shapeDiffInterpretors(
  diff: ParsedDiff,
  learnedTrails: IValueAffordanceSerializationWithCounter,
  rfcBaseState: DiffRfcBaseState
): ISuggestion[] {
  const asShapeDiff = diff.asShapeDiff()!;
  const { shapeTrail, jsonTrail } = asShapeDiff;

  const isUnmatched = asShapeDiff.isUnmatched;
  const isUnspecified = asShapeDiff.isUnspecified;

  const actual = new Actual(learnedTrails, shapeTrail, jsonTrail);
  const expected = new Expectation(diff, rfcBaseState, shapeTrail, jsonTrail);

  /////////////////////////////////////////////////////////////////////

  if (expected.isField()) {
    return fieldShapeDiffInterpretor(
      asShapeDiff,
      actual,
      expected,
      rfcBaseState
    );
  }

  return [];
}
