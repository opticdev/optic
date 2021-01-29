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
import { Actual, Expectation } from '../shape-diff-dsl';
import { fieldShapeDiffInterpretor } from './field';
import { DiffSessionConfig } from '../../interfaces/session';
import { IJsonObjectKey } from '@useoptic/cli-shared/build/diffs/json-trail';
import { listItemShapeDiffInterpreter } from './list';
import { rootShapeDiffInterpreter } from './root';

//only ever take 1 diff at a time
export function interpretShapeDiffs(
  diff: ParsedDiff,
  learnedTrails: IValueAffordanceSerializationWithCounter,
  services: DiffSessionConfig
): IInterpretation {
  const asShapeDiff = diff.asShapeDiff(services.rfcBaseState)!;
  const { rfcBaseState } = services;
  const { normalizedShapeTrail, jsonTrail } = asShapeDiff;

  const isUnmatched = asShapeDiff.isUnmatched;
  const isUnspecified = asShapeDiff.isUnspecified;

  const actual = new Actual(learnedTrails, normalizedShapeTrail, jsonTrail);
  const expected = new Expectation(
    diff,
    rfcBaseState,
    normalizedShapeTrail,
    jsonTrail
  );

  // Route to field interpreter
  /////////////////////////////////////////////////////////////////////
  const isUnspecifiedField = isUnspecified && actual.isField(); //this needs to use lastObject + key
  if (expected.isField() || isUnspecifiedField) {
    return fieldShapeDiffInterpretor(asShapeDiff, actual, expected, services);
  }

  // Route to list item
  /////////////////////////////////////////////////////////////////////
  if (expected.isListItemShape()) {
    return listItemShapeDiffInterpreter(
      asShapeDiff,
      actual,
      expected,
      services
    );
  }

  // Route to Root
  /////////////////////////////////////////////////////////////////////

  if (expected.rootShapeId() && normalizedShapeTrail.path.length === 0) {
    return rootShapeDiffInterpreter(asShapeDiff, actual, expected, services);
  }

  return { suggestions: [], previewTabs: [] };
}
