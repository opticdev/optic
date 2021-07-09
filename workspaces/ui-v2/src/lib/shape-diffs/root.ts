import { BodyShapeDiff } from '../parse-diff';
import { Actual, Expectation } from '../shape-diff-dsl-rust';
import {
  CurrentSpecContext,
  IDiffDescription,
  IInteractionPreviewTab,
  IInterpretation,
  IParsedLocation,
  IPatchChoices,
} from '../Interfaces';
import sortBy from 'lodash.sortby';
import { code, plain } from '<src>/pages/diffs/components/ICopyRender';
import invariant from 'invariant';
import { builderInnerShapeFromChoices } from './build-inner-shape';
import {
  SetRequestBodyShape,
  SetResponseBodyShape,
  ShapedBodyDescriptor,
  SetQueryParametersShape,
  QueryParametersShapeDescriptor,
  CQRSCommand,
} from '@useoptic/spectacle';

export function rootShapeDiffInterpreter(
  shapeDiff: BodyShapeDiff,
  diffDescription: IDiffDescription,
  actual: Actual,
  expected: Expectation,
  currentSpecContext: CurrentSpecContext
): IInterpretation {
  const isUnmatched = shapeDiff.isUnmatched;
  const isUnspecified = shapeDiff.isUnspecified;

  const location = shapeDiff.location;

  let updateSpecChoices: IPatchChoices = {
    copy: [],
    shapes: [],
    isField: false,
  };

  if (isUnmatched) {
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
    'root object should never produce an unspecified diff'
  );

  ////////////////
  const expectedShapes = expected.expectedShapes();
  const previews: IInteractionPreviewTab[] = [];
  actual.interactionsGroupedByCoreShapeKind().forEach((i) => {
    previews.push({
      title: i.label,
      invalid: !expectedShapes.has(i.kind),
      interactionPointers: i.interactions,
      assertion: [plain('expected'), code(expected.shapeName())],
      jsonTrailsByInteractions: i.jsonTrailsByInteractions,
    });
  });
  ////////////////

  return {
    diffDescription,
    updateSpecChoices,
    toCommands: (choices: IPatchChoices): CQRSCommand[] => {
      const { commands, rootShapeId } = builderInnerShapeFromChoices(
        choices,
        expected.allowedCoreShapeKindsByShapeId(),
        actual,
        currentSpecContext
      );

      const resetShapeCommand = resetBaseShape(location, rootShapeId);

      return [...commands, resetShapeCommand];
    },
    previewTabs: sortBy(previews, (i) => !i.invalid),
  };
}

function resetBaseShape(
  location: IParsedLocation,
  newShapeId: string
): CQRSCommand {
  if (location.data.type === 'request') {
    return SetRequestBodyShape(
      location.data.requestId,
      ShapedBodyDescriptor(location.data.contentType, newShapeId, false)
    );
  } else if (location.data.type === 'response') {
    return SetResponseBodyShape(
      location.data.responseId,
      ShapedBodyDescriptor(location.data.contentType, newShapeId, false)
    );
  } else {
    // Through typescript inference we know the only other possible shape is a query parameter
    return SetQueryParametersShape(
      location.data.queryParametersId,
      QueryParametersShapeDescriptor(newShapeId)
    );
  }
}
