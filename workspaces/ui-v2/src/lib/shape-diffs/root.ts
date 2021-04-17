import { BodyShapeDiff } from '../parse-diff';
import { opticEngine } from '@useoptic/domain';
import { Actual, Expectation } from '../shape-diff-dsl-rust';
import {
  CurrentSpecContext,
  IDiffDescription,
  IInteractionPreviewTab,
  IInterpretation,
  IParsedLocation,
  IPatchChoices,
} from '../Interfaces';
import { targetKindSuggestion } from './target-shape-kind';
import { setEquals } from '../set-ops';
import sortBy from 'lodash.sortby';
import { code, plain } from '../../optic-components/diffs/render/ICopyRender';
import invariant from 'invariant';
import { builderInnerShapeFromChoices } from './build-inner-shape';
import {
  SetRequestBodyShape,
  SetResponseBodyShape,
  ShapedBodyDescriptor,
} from '../command-factory';

const LearnJsonTrailAffordances = opticEngine.com.useoptic.diff.interactions.interpreters.distribution_aware.LearnJsonTrailAffordances();

export function rootShapeDiffInterpreter(
  shapeDiff: BodyShapeDiff,
  diffDescription: IDiffDescription,
  actual: Actual,
  expected: Expectation,
  currentSpecContext: CurrentSpecContext,
): IInterpretation {
  const { shapeTrail, jsonTrail } = shapeDiff;
  const isUnmatched = shapeDiff.isUnmatched;
  const isUnspecified = shapeDiff.isUnspecified;

  const location = shapeDiff.location;

  let updateSpecChoices: IPatchChoices = {
    copy: [],
    shapes: [],
    isField: false,
  };

  if (isUnmatched) {
    const unexpectedShapesObserved = expected.diffActual(actual);
    const allShapes = expected.unionWithActual(actual);

    updateSpecChoices.shapes = Array.from(allShapes).map((i) => {
      return {
        coreShapeKind: i,
        isValid: true,
      };
    });
  }

  invariant(
    !isUnspecified,
    'root object should never produce an unspecified diff',
  );

  ////////////////
  const expectedShapes = expected.expectedShapes();
  const previews: IInteractionPreviewTab[] = [];
  actual.interactionsGroupedByCoreShapeKind().forEach((i) => {
    previews.push({
      title: i.label,
      invalid: !expectedShapes.has(i.kind),
      allowsExpand: true,
      interactionPointers: i.interactions,
      ignoreRule: {
        diffHash: shapeDiff.diffHash(),
        examplesOfCoreShapeKinds: i.kind,
      },
      assertion: [plain('expected'), code(expected.shapeName())],
      jsonTrailsByInteractions: i.jsonTrailsByInteractions,
    });
  });
  ////////////////

  return {
    diffDescription,
    updateSpecChoices,
    toCommands: (choices: IPatchChoices) => {
      const { commands, rootShapeId } = builderInnerShapeFromChoices(
        choices,
        expected,
        actual,
        currentSpecContext,
      );

      return [...commands, resetBaseShape(location, rootShapeId)];
    },
    previewTabs: sortBy(previews, (i) => !i.invalid),
    // overrideTitle?: ICopy[];
  };
}

function resetBaseShape(location: IParsedLocation, newShapeId: string) {
  if (location.inRequest) {
    return SetRequestBodyShape(
      location.inRequest.requestId!,
      ShapedBodyDescriptor(location.inRequest.contentType!, newShapeId, false),
    );
  } else if (location.inResponse) {
    return SetResponseBodyShape(
      location.inResponse.responseId!,
      ShapedBodyDescriptor(location.inResponse.contentType!, newShapeId, false),
    );
  }
}
