import { BodyShapeDiff, ParsedDiff } from '../../parse-diff';
import {
  IChangeType,
  IInterpretation,
  ISuggestion,
  plain,
} from '../../interfaces/interpretors';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounter,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { DiffRfcBaseState } from '../../interfaces/diff-rfc-base-state';
import { Actual, Expectation } from '../shape-diff-dsl';
import { fieldShapeDiffInterpretor } from './field';
import { InteractiveSessionConfig } from '../../interfaces/session';
import { shapeChangeInterpretor } from './shape-changed';

//only ever take 1 diff at a time
export function interpretShapeDiffs(
  diff: ParsedDiff,
  learnedTrails: IValueAffordanceSerializationWithCounter,
  services: InteractiveSessionConfig
): IInterpretation {
  const asShapeDiff = diff.asShapeDiff(services.rfcBaseState)!;
  const { rfcBaseState } = services;
  const { shapeTrail, jsonTrail } = asShapeDiff;

  const isUnmatched = asShapeDiff.isUnmatched;
  const isUnspecified = asShapeDiff.isUnspecified;

  const actual = new Actual(learnedTrails, shapeTrail, jsonTrail);
  const expected = new Expectation(diff, rfcBaseState, shapeTrail, jsonTrail);

  // Route to field interpretor
  /////////////////////////////////////////////////////////////////////

  if (expected.isField()) {
    return fieldShapeDiffInterpretor(asShapeDiff, actual, expected, services);
  }

  /////////////////////////////////////////////////////////////////////

  // Specifying Unknowns
  /////////////////////////////////////////////////////////////////////
  // if (expected.isNullable() && isUnspecified) {
  //   console.warn('have not implemented filling nullables');
  //   return { suggestions: [], previewTabs: [] };
  // }

  /////////////////////////////////////////////////////////////////////

  // Route to shape interpretor. This should always happen last
  /////////////////////////////////////////////////////////////////////
  const additionalKindsObserved = expected.diffActual(actual);
  if (additionalKindsObserved.length) {
    return shapeChangeInterpretor(asShapeDiff, actual, expected, services);
  }

  return { suggestions: [], previewTabs: [] };
}
