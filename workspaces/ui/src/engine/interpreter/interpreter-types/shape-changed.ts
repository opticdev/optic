import { BodyShapeDiff } from '../../parse-diff';
import { Actual, Expectation } from '../shape-diff-dsl';

import { JsonHelper, opticEngine } from '@useoptic/domain';
import { DiffSessionConfig } from '../../interfaces/session';
import {
  code,
  IInteractionPreviewTab,
  IInterpretation,
  plain,
} from '../../interfaces/interpretors';

const LearnJsonTrailAffordances = opticEngine.com.useoptic.diff.interactions.interpreters.distribution_aware.LearnJsonTrailAffordances();

export function shapeChangeInterpretor(
  shapeDiff: BodyShapeDiff,
  actual: Actual,
  expected: Expectation,
  services: DiffSessionConfig
): IInterpretation {
  const { shapeTrail, jsonTrail } = shapeDiff;

  const additionalKindsObserved = expected.diffActual(actual);

  const tabs: IInteractionPreviewTab[] = actual
    .interactionsGroupedByCoreShapeKind()
    .map((shapeGrouping) => {
      return {
        interactionPointers: shapeGrouping.interactions,
        title: shapeGrouping.label,
        allowsExpand: true,
        assertion: [plain('expected'), code(expected.shapeName())],
        invalid: additionalKindsObserved.includes(shapeGrouping.kind),
        jsonTrailsByInteractions: shapeGrouping.jsonTrailsByInteractions,
        ignoreRule: {
          diffHash: shapeDiff.diffHash(),
          examplesOfCoreShapeKinds: shapeGrouping.kind,
        },
      };
    });

  const union = expected.unionWithActual(actual);
  console.log(union);

  const suggestions = [
    // union Observation Types + Spec Types    -- ignores,
    // union Observations Types                -- ignores    gives you control to remove stuff
  ];

  return { suggestions: [], previewTabs: [] };
}
