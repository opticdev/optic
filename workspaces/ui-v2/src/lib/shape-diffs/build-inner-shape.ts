import {
  CurrentSpecContext,
  ICoreShapeInnerParameterNames,
  ICoreShapeKinds,
  IPatchChoices,
} from '../Interfaces';
import { Actual, Expectation } from '../shape-diff-dsl-rust';
import { JsonHelper, opticEngine, toOption } from '@useoptic/domain';
import {
  AddShape,
  AddShapeParameter,
  ProviderInShape,
  SetParameterShape,
  ShapeProvider,
} from '../command-factory';

const LearnJsonTrailAffordances = opticEngine.com.useoptic.diff.interactions.interpreters.distribution_aware.LearnJsonTrailAffordances();

export function builderInnerShapeFromChoices(
  choices: IPatchChoices,
  expected: Expectation,
  actual: Actual,
  currentSpecContext: CurrentSpecContext,
): { rootShapeId: string; commands: any[] } {
  const randomIds = opticEngine.com.useoptic.OpticIdsJsHelper().random;

  const targetKinds = new Set([
    ...choices.shapes.filter((i) => i.isValid).map((i) => i.coreShapeKind),
  ]);

  targetKinds.delete(ICoreShapeKinds.OptionalKind);
  targetKinds.delete(ICoreShapeKinds.NullableKind);

  const allowedKindsById = expected.allowedCoreShapeKindsByShapeId();

  const newCommands = [];

  const innerShapeIds = Array.from(targetKinds).map((i) => {
    const foundShapeId = Object.entries(allowedKindsById).find(
      ([key, shape]) => shape === i,
    );

    if (foundShapeId) {
      return foundShapeId[0];
    } else {
      // make new shape
      const { rootShapeId, commands } = JsonHelper.toJs(
        LearnJsonTrailAffordances.toCommandsJson(
          JSON.stringify(actual.learnedTrails.affordances),
          JSON.stringify(actual.jsonTrail),
          randomIds,
          toOption(i),
        ),
      );

      newCommands.push(...commands);
      return rootShapeId;
    }
  });

  let rootShapeId = (() => {
    if (innerShapeIds.length === 1) {
      return innerShapeIds[0];
    } else if (innerShapeIds.length === 0) {
      const unknownId = randomIds.newShapeId();
      newCommands.push(AddShape(unknownId, ICoreShapeKinds.UnknownKind));
      return unknownId;
    } else {
      const oneOfWrapperShape = randomIds.newShapeId();
      newCommands.push(
        AddShape(oneOfWrapperShape, ICoreShapeKinds.OneOfKind.toString(), ''),
      );
      innerShapeIds.forEach((i) => {
        const newParamId = randomIds.newShapeParameterId();
        newCommands.push(
          ...[
            AddShapeParameter(newParamId, oneOfWrapperShape, ''),
            SetParameterShape(
              ProviderInShape(oneOfWrapperShape, ShapeProvider(i), newParamId),
            ),
          ],
        );
      });

      return oneOfWrapperShape;
    }
  })();

  const shouldMakeNullable = Boolean(
    choices.shapes.find(
      (i) => i.coreShapeKind === ICoreShapeKinds.NullableKind && i.isValid,
    ),
  );

  if (shouldMakeNullable) {
    const wrapperShapeId = randomIds.newShapeId();

    newCommands.push(
      ...[
        AddShape(wrapperShapeId, ICoreShapeKinds.NullableKind.toString(), ''),
        SetParameterShape(
          ProviderInShape(
            wrapperShapeId,
            ShapeProvider(rootShapeId),
            ICoreShapeInnerParameterNames.NullableInner,
          ),
        ),
      ],
    );

    rootShapeId = wrapperShapeId;
  }
  if (choices.isField && choices.isOptional) {
    const wrapperShapeId = randomIds.newShapeId();
    newCommands.push(
      ...[
        AddShape(wrapperShapeId, ICoreShapeKinds.OptionalKind.toString(), ''),
        SetParameterShape(
          ProviderInShape(
            wrapperShapeId,
            ShapeProvider(rootShapeId),
            ICoreShapeInnerParameterNames.OptionalInner,
          ),
        ),
      ],
    );

    rootShapeId = wrapperShapeId;
  }

  return { rootShapeId, commands: newCommands };
}
