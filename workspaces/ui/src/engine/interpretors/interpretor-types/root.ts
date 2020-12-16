import { BodyShapeDiff } from '../../parse-diff';
import { Actual, Expectation } from '../shape-diff-dsl';
import { InteractiveSessionConfig } from '../../interfaces/session';
import {
  code,
  IChangeType,
  ICopy,
  IInteractionPreviewTab,
  IInterpretation,
  ISuggestion,
  plain,
} from '../../interfaces/interpretors';
import invariant from 'invariant';
import {
  ICoreShapeInnerParameterNames,
  ICoreShapeKinds,
} from '../../interfaces/interfaces';
import { nameForCoreShapeKind, namerForOneOf } from '../quick-namer';
import { setDifference, setEquals, setUnion } from '../../set-ops';
import { targetKindSuggestion } from '../target-shape-kind';
import {
  IShapeChange,
  reduceShapeChangesToCommandsAndMappings,
  serializeCommands,
} from '../spec-change-dsl';
import sortBy from 'lodash.sortby';
import { JsonHelper, opticEngine, toOption } from '@useoptic/domain';

const LearnJsonTrailAffordances = opticEngine.com.useoptic.diff.interactions.interpreters.distribution_aware.LearnJsonTrailAffordances();

export function rootShapeDiffInterpreter(
  shapeDiff: BodyShapeDiff,
  actual: Actual,
  expected: Expectation,
  services: InteractiveSessionConfig
): IInterpretation {
  const { shapeTrail, jsonTrail } = shapeDiff;
  const isUnmatched = shapeDiff.isUnmatched;
  const isUnspecified = shapeDiff.isUnspecified;

  const suggestions = [];

  if (isUnmatched) {
    const withUnion = targetKindSuggestion(true, expected, actual);
    const withoutUnion = targetKindSuggestion(false, expected, actual);
    suggestions.push(suggestionFor(withUnion, expected, actual, services));
    if (!setEquals(withoutUnion.targetFinal, withoutUnion.targetFinal)) {
      suggestions.push(suggestionFor(withoutUnion, expected, actual, services));
    }
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
    suggestions: suggestions,
    previewTabs: sortBy(previews, (i) => !i.invalid),
    // overrideTitle?: ICopy[];
  };
}

function suggestionFor(
  {
    shapeChange,
    updatedShapeName,
  }: {
    shapeChange: IShapeChange;
    updatedShapeName: ICopy[];
  },
  expected: Expectation,
  actual: Actual,
  services: InteractiveSessionConfig
): ISuggestion {
  const ids = services.rfcBaseState.domainIdGenerator;

  function commandsFromSpecChange(): {
    commands: any[];
    innerRootShapeId: string;
  } {
    if (shapeChange.add.size > 0 || shapeChange.remove.size > 0) {
      const {
        newCommands,
        addedMapping,
        targetFinal,
        existingShapeIdsForTypes,
      } = reduceShapeChangesToCommandsAndMappings(
        shapeChange,
        expected,
        actual,
        services.rfcBaseState
      );

      if (targetFinal.size === 0) {
        invariant(false, 'unexpected, should not ever change to unknown');
      } else if (targetFinal.size === 1) {
        const oneKind: ICoreShapeKinds = Array.from(targetFinal)[0];
        const hasExistingShapeId: string | undefined =
          existingShapeIdsForTypes[oneKind];
        if (hasExistingShapeId) {
          return {
            commands: newCommands,
            innerRootShapeId: hasExistingShapeId!,
          };
        } else {
          const newShapeId: string | undefined = addedMapping[oneKind];
          invariant(
            Boolean(newShapeId),
            'new shapes created by the helper, should have ids'
          );
          return { commands: newCommands, innerRootShapeId: newShapeId! };
        }
      } else if (targetFinal.size > 1) {
        const oneOfWrapperShape = ids.newShapeId();
        const {
          AddShape,
          SetParameterShape,
          AddShapeParameter,
          ProviderInShape,
          ShapeProvider,
        } = opticEngine.com.useoptic.contexts.shapes.Commands;

        newCommands.push(
          AddShape(oneOfWrapperShape, ICoreShapeKinds.OneOfKind.toString(), '')
        );

        //add each type
        Array.from(targetFinal)
          .sort()
          .forEach((kind) => {
            const specificTypeShapeId =
              existingShapeIdsForTypes[kind] || addedMapping[kind];
            invariant(
              Boolean(specificTypeShapeId),
              'can not create one of if shape does not exist'
            );
            const newParamId = ids.newShapeParameterId();
            newCommands.push(
              AddShapeParameter(newParamId, oneOfWrapperShape, ''),
              SetParameterShape(
                ProviderInShape(
                  oneOfWrapperShape,
                  ShapeProvider(specificTypeShapeId),
                  newParamId
                )
              )
            );
          });

        return { commands: newCommands, innerRootShapeId: oneOfWrapperShape };
      }
    } else {
      return { commands: [], innerRootShapeId: expected.lastListItem() };
    }
  }

  const innerShape = commandsFromSpecChange();

  const {
    AddShape,
    SetParameterShape,
    ProviderInShape,
    ShapeProvider,
    SetBaseShape,
  } = opticEngine.com.useoptic.contexts.shapes.Commands;

  const isWrappedInNullable = expected
    .unionWithActual(actual)
    .includes(ICoreShapeKinds.NullableKind);

  const commands = [...innerShape.commands];

  if (isWrappedInNullable) {
    const wrapperShapeId = ids.newShapeId();
    commands.push(
      AddShape(wrapperShapeId, ICoreShapeKinds.NullableKind.toString(), ''),
      SetParameterShape(
        ProviderInShape(
          wrapperShapeId,
          ShapeProvider(innerShape.innerRootShapeId),
          ICoreShapeInnerParameterNames.NullableInner
        )
      ),
      SetBaseShape(expected.rootShapeId(), wrapperShapeId)
    );
  } else {
    if (expected.rootShapeId() !== innerShape.innerRootShapeId) {
      commands.push(
        SetBaseShape(expected.rootShapeId(), innerShape.innerRootShapeId)
      );
    }
  }

  const sharedCopy: ICopy[] = isWrappedInNullable ? [code('Nullable')] : [];

  return {
    action: {
      activeTense: [
        plain('make root shape'),
        ...sharedCopy,
        ...updatedShapeName,
      ],
      pastTense: [
        plain('Marked root shape a'),
        ...sharedCopy,
        ...updatedShapeName,
      ],
    },
    commands: serializeCommands(commands),
    changeType: IChangeType.Changed,
  };
}
