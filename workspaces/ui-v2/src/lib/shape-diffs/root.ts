import { BodyShapeDiff, DiffLocation } from '../parse-diff';
import { Actual, Expectation } from '../shape-diff-dsl-rust';
import {
  CurrentSpecContext,
  IDiffDescription,
  IInteractionPreviewTab,
  IInterpretation,
  IPatchChoices,
} from '../Interfaces';
import sortBy from 'lodash.sortby';
import { code, plain } from '<src>/pages/diffs/components/ICopyRender';
import { builderInnerShapeFromChoices } from './build-inner-shape';
import {
  SetRequestBodyShape,
  SetResponseBodyShape,
  ShapedBodyDescriptor,
  SetQueryParametersShape,
  QueryParametersShapeDescriptor,
  CQRSCommand,
} from '@useoptic/optic-domain';

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
    isQueryParam: shapeDiff.location.isQueryParameter(),
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

  if (isUnspecified) {
    throw new Error('root object should never produce an unspecified diff');
  }

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

      return resetShapeCommand ? [...commands, resetShapeCommand] : commands;
    },
    previewTabs: sortBy(previews, (i) => !i.invalid),
  };
}

function resetBaseShape(
  location: DiffLocation,
  newShapeId: string
): CQRSCommand | null {
  const requestDescriptor = location.getRequestDescriptor();
  const responseDescriptor = location.getResponseDescriptor();
  const queryParametersId = location.getQueryParametersId();
  if (requestDescriptor && requestDescriptor.requestId) {
    return SetRequestBodyShape(
      requestDescriptor.requestId,
      ShapedBodyDescriptor(requestDescriptor.contentType, newShapeId, false)
    );
  } else if (
    responseDescriptor &&
    responseDescriptor.responseId &&
    responseDescriptor.contentType
  ) {
    return SetResponseBodyShape(
      responseDescriptor.responseId,
      ShapedBodyDescriptor(responseDescriptor.contentType, newShapeId, false)
    );
  } else if (queryParametersId) {
    return SetQueryParametersShape(
      queryParametersId,
      QueryParametersShapeDescriptor(newShapeId)
    );
  } else {
    // path_request and path_response are invalid locations that I don't believe hit this path
    console.error('Unknown location received', location);
    return null;
  }
}
