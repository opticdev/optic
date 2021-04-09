import { IValueAffordanceSerializationWithCounter } from '@useoptic/cli-shared/build/diffs/initial-types';

// import { fieldShapeDiffInterpretor } from './field';
//
// import { listItemShapeDiffInterpreter } from './list';
// import { rootShapeDiffInterpreter } from './root';
import { BodyShapeDiff } from '../parse-diff';
import {
  CurrentSpecContext,
  IInterpretation,
  IPatchChoices,
} from '../Interfaces';
import { Actual, getExpectationsForShapeTrail } from '../shape-diff-dsl-rust';
import { fieldShapeDiffInterpretor } from './field';
import { descriptionForShapeDiff } from '../diff-description-interpreter';

export async function interpretShapeDiffs(
  diff: BodyShapeDiff,
  learnedTrails: IValueAffordanceSerializationWithCounter,
  spectacle: any,
  currentSpecContext: CurrentSpecContext
): Promise<IInterpretation> {
  const { normalizedShapeTrail, jsonTrail } = diff;

  const isUnmatched = diff.isUnmatched;
  const isUnspecified = diff.isUnspecified;

  const diffDescription = await descriptionForShapeDiff(
    diff,
    spectacle,
    currentSpecContext
  );

  const actual = new Actual(learnedTrails, normalizedShapeTrail, jsonTrail);
  const expected = await getExpectationsForShapeTrail(
    diff.shapeTrail,
    spectacle,
    currentSpecContext
  );

  // Route to field interpreter
  /////////////////////////////////////////////////////////////////////
  const isUnspecifiedField = isUnspecified && actual.isField(); //this needs to use lastObject + key
  if (expected.isField() || isUnspecifiedField) {
    return fieldShapeDiffInterpretor(
      diff,
      actual,
      expected,
      diffDescription,
      currentSpecContext
    );
  }

  // Route to list item
  /////////////////////////////////////////////////////////////////////
  /*  if (expected.isListItemShape()) {
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
  }*/

  throw new Error('No interpreter');

  // return {
  //   diffDescription: undefined, toCommands(choices: IPatchChoices): any[] {
  //     return [];
  //   }, suggestions: [], previewTabs: [], specChoices: {shapes: [], } };
}
