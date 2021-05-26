import { IValueAffordanceSerializationWithCounter } from '@useoptic/cli-shared/build/diffs/initial-types';
import { BodyShapeDiff } from '../parse-diff';
import { CurrentSpecContext, IInterpretation } from '../Interfaces';
import { Actual, getExpectationsForShapeTrail } from '../shape-diff-dsl-rust';
import { fieldShapeDiffInterpreter } from './field';
import { descriptionForShapeDiff } from '../diff-description-interpreter';
import { listItemShapeDiffInterpreter } from './list';
import { rootShapeDiffInterpreter } from './root';

export async function interpretShapeDiffs(
  diff: BodyShapeDiff,
  learnedTrails: IValueAffordanceSerializationWithCounter,
  spectacle: any,
  currentSpecContext: CurrentSpecContext
): Promise<IInterpretation> {
  const { normalizedShapeTrail, jsonTrail } = diff;

  // const isUnmatched = diff.isUnmatched;
  const isUnspecified = diff.isUnspecified;

  const diffDescription = await descriptionForShapeDiff(
    diff,
    spectacle,
    currentSpecContext
  );

  const actual = new Actual(learnedTrails, normalizedShapeTrail, jsonTrail);
  const expected = await getExpectationsForShapeTrail(
    diff.shapeTrail,
    diff.jsonTrail,
    spectacle,
    currentSpecContext
  );

  // Route to field interpreter
  /////////////////////////////////////////////////////////////////////
  const isUnspecifiedField = isUnspecified && actual.isField(); //this needs to use lastObject + key
  if (expected.isField() || actual.isField() || isUnspecifiedField) {
    return fieldShapeDiffInterpreter(
      diff,
      actual,
      expected,
      diffDescription,
      currentSpecContext
    );
  }

  // Route to list item
  /////////////////////////////////////////////////////////////////////
  if (expected.isListItemShape()) {
    return listItemShapeDiffInterpreter(
      diff,
      actual,
      expected,
      diffDescription,
      currentSpecContext
    );
  }

  // Route to Root
  /////////////////////////////////////////////////////////////////////
  if (expected.rootShapeId() && normalizedShapeTrail.path.length === 0) {
    return rootShapeDiffInterpreter(
      diff,
      diffDescription,
      actual,
      expected,
      currentSpecContext
    );
  }

  throw new Error('No interpreter');

  // return {
  //   diffDescription: undefined, toCommands(choices: IPatchChoices): any[] {
  //     return [];
  //   }, suggestions: [], previewTabs: [], specChoices: {shapes: [], } };
}
