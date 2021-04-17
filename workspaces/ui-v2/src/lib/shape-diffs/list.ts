import sortBy from 'lodash.sortby';
import { opticEngine } from '@useoptic/domain';
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

const LearnJsonTrailAffordances = opticEngine.com.useoptic.diff.interactions.interpreters.distribution_aware.LearnJsonTrailAffordances();

export function listItemShapeDiffInterpreter(
  shapeDiff: BodyShapeDiff,
  actual: Actual,
  expected: Expectation,
  diffDescription: IDiffDescription,
  currentSpecContext: CurrentSpecContext,
): IInterpretation {
  const { shapeTrail, jsonTrail } = shapeDiff;
  const isUnmatched = shapeDiff.isUnmatched;
  const isUnspecified = shapeDiff.isUnspecified;

  let updateSpecChoices: IPatchChoices = {
    copy: [],
    shapes: [],
    isField: false,
  };

  if (isUnmatched) {
    const unexpectedShapesObserved = expected.diffActual(actual);
    const allShapes = expected.unionWithActual(actual);
    const observedShapeDidNotMatch = unexpectedShapesObserved.length > 0;

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
