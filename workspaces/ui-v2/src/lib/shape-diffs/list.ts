import sortBy from 'lodash.sortby';
import { BodyShapeDiff } from '../parse-diff';
import { Actual, Expectation } from '../shape-diff-dsl-rust';
import {
  CurrentSpecContext,
  ICoreShapeInnerParameterNames,
  ICoreShapeKinds,
  IDiffDescription,
  IInteractionPreviewTab,
  IInterpretation,
  IPatchChoices,
} from '../Interfaces';
import { code, plain } from '../../optic-components/diffs/render/ICopyRender';
import { builderInnerShapeFromChoices } from './build-inner-shape';
import {
  ProviderInShape,
  SetParameterShape,
  ShapeProvider,
} from '../command-factory';

export function listItemShapeDiffInterpreter(
  shapeDiff: BodyShapeDiff,
  actual: Actual,
  expected: Expectation,
  diffDescription: IDiffDescription,
  currentSpecContext: CurrentSpecContext,
): IInterpretation {
  const isUnmatched = shapeDiff.isUnmatched;

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

  ////////////////
  const expectedShapes = expected.expectedShapes();
  const previews: IInteractionPreviewTab[] = [];
  actual.interactionsGroupedByCoreShapeKind().forEach((i) => {
    if (i.kind !== ICoreShapeKinds.OptionalKind) {
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
    }
  });
  ////////////////
  return {
    diffDescription: diffDescription,
    toCommands(choices: IPatchChoices): any[] {
      if (isUnmatched) {
        const { commands, rootShapeId } = builderInnerShapeFromChoices(
          choices,
          expected,
          actual,
          currentSpecContext,
        );

        const lastList = expected.lastList();
        return [
          ...commands,
          SetParameterShape(
            ProviderInShape(
              lastList,
              ShapeProvider(rootShapeId),
              ICoreShapeInnerParameterNames.ListInner,
            ),
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
