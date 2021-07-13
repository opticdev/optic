import sortBy from 'lodash.sortby';
import { BodyShapeDiff } from '../parse-diff';
import { Actual, Expectation } from '../shape-diff-dsl-rust';
import {
  CurrentSpecContext,
  IDiffDescription,
  IInteractionPreviewTab,
  IInterpretation,
  IPatchChoices,
} from '../Interfaces';
import { code, plain } from '<src>/pages/diffs/components/ICopyRender';
import { builderInnerShapeFromChoices } from './build-inner-shape';
import {
  ICoreShapeInnerParameterNames,
  ICoreShapeKinds,
  ProviderInShape,
  SetParameterShape,
  ShapeProvider,
  CQRSCommand,
} from '@useoptic/optic-domain';

export function listItemShapeDiffInterpreter(
  shapeDiff: BodyShapeDiff,
  actual: Actual,
  expected: Expectation,
  diffDescription: IDiffDescription,
  currentSpecContext: CurrentSpecContext
): IInterpretation {
  const isUnmatched = shapeDiff.isUnmatched;

  let updateSpecChoices: IPatchChoices = {
    copy: [],
    shapes: [],
    isField: false,
    isQueryParam: shapeDiff.location.descriptor.type === 'query',
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

  ////////////////
  const expectedShapes = expected.expectedShapes();
  const previews: IInteractionPreviewTab[] = [];
  actual.interactionsGroupedByCoreShapeKind().forEach((i) => {
    if (i.kind !== ICoreShapeKinds.OptionalKind) {
      previews.push({
        title: i.label,
        invalid: !expectedShapes.has(i.kind),
        interactionPointers: i.interactions,
        assertion: [plain('expected'), code(expected.shapeName())],
        jsonTrailsByInteractions: i.jsonTrailsByInteractions,
      });
    }
  });
  ////////////////
  return {
    diffDescription: diffDescription,
    toCommands(choices: IPatchChoices): CQRSCommand[] {
      if (!choices) {
        return [];
      }
      if (isUnmatched) {
        const { commands, rootShapeId } = builderInnerShapeFromChoices(
          choices,
          expected.allowedCoreShapeKindsByShapeId(),
          actual,
          currentSpecContext
        );

        const lastList = expected.lastList();
        return [
          ...commands,
          SetParameterShape(
            ProviderInShape(
              lastList,
              ShapeProvider(rootShapeId),
              ICoreShapeInnerParameterNames.ListInner
            )
          ),
        ];
      }
      return [];
    },
    updateSpecChoices,
    previewTabs: sortBy(previews, (i) => !i.invalid),
    // overrideTitle?: ICopy[];
  };
}
