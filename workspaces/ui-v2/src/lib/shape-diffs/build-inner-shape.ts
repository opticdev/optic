import {
  CurrentSpecContext,
  ICoreShapeInnerParameterNames,
  ICoreShapeKinds,
  IPatchChoices,
} from '../Interfaces';
import { Actual } from '../shape-diff-dsl-rust';
import equals from 'lodash.isequal';
import {
  AddShape,
  AddShapeParameter,
  ProviderInShape,
  SetParameterShape,
  ShapeProvider,
} from '../command-factory';

export function builderInnerShapeFromChoices(
  choices: IPatchChoices,
  allowedCoreShapeKindsByShapeId: { [key: string]: ICoreShapeKinds },
  actual: Actual,
  currentSpecContext: CurrentSpecContext
): { rootShapeId: string; commands: any[] } {
  const targetKinds = new Set([
    ...choices.shapes.filter((i) => i.isValid).map((i) => i.coreShapeKind),
  ]);

  targetKinds.delete(ICoreShapeKinds.OptionalKind);
  targetKinds.delete(ICoreShapeKinds.NullableKind);

  const newCommands = [];

  const innerShapeIds = Array.from(targetKinds).map((i) => {
    const foundShapeId = Object.entries(allowedCoreShapeKindsByShapeId).find(
      ([key, shape]) => shape === i
    );

    if (foundShapeId) {
      return foundShapeId[0];
    } else {
      const filterToTarget = actual.learnedTrails.affordances.map(
        (affordance) => {
          if (equals(affordance.trail, actual.jsonTrail)) {
            return {
              ...affordance,
              wasString: i === ICoreShapeKinds.StringKind,
              wasNumber: i === ICoreShapeKinds.NumberKind,
              wasBoolean: i === ICoreShapeKinds.BooleanKind,
              wasNull: i === ICoreShapeKinds.NullableKind,
              wasArray: i === ICoreShapeKinds.ListKind,
              wasObject: i === ICoreShapeKinds.ObjectKind,
              fieldSet:
                i === ICoreShapeKinds.ObjectKind ? affordance.fieldSet : [],
            };
          } else {
            return affordance;
          }
        }
      );

      const [commands, newShapeId] = JSON.parse(
        currentSpecContext.opticEngine.affordances_to_commands(
          JSON.stringify(filterToTarget),
          JSON.stringify(actual.jsonTrail)
        )
      );

      newCommands.push(...commands);
      return newShapeId;
    }
  });

  let rootShapeId = (() => {
    if (innerShapeIds.length === 1) {
      return innerShapeIds[0];
    } else if (innerShapeIds.length === 0) {
      const unknownId = currentSpecContext.domainIds.newShapeId();
      newCommands.push(AddShape(unknownId, ICoreShapeKinds.UnknownKind));
      return unknownId;
    } else {
      const oneOfWrapperShape = currentSpecContext.domainIds.newShapeId();
      newCommands.push(
        AddShape(oneOfWrapperShape, ICoreShapeKinds.OneOfKind.toString(), '')
      );
      innerShapeIds.forEach((i) => {
        const newParamId = currentSpecContext.domainIds.newShapeParameterId();
        newCommands.push(
          ...[
            AddShapeParameter(newParamId, oneOfWrapperShape, ''),
            SetParameterShape(
              ProviderInShape(oneOfWrapperShape, ShapeProvider(i), newParamId)
            ),
          ]
        );
      });

      return oneOfWrapperShape;
    }
  })();

  const shouldMakeNullable = Boolean(
    choices.shapes.find(
      (i) => i.coreShapeKind === ICoreShapeKinds.NullableKind && i.isValid
    )
  );

  if (shouldMakeNullable) {
    const wrapperShapeId = currentSpecContext.domainIds.newShapeId();

    newCommands.push(
      ...[
        AddShape(wrapperShapeId, ICoreShapeKinds.NullableKind.toString(), ''),
        SetParameterShape(
          ProviderInShape(
            wrapperShapeId,
            ShapeProvider(rootShapeId),
            ICoreShapeInnerParameterNames.NullableInner
          )
        ),
      ]
    );

    rootShapeId = wrapperShapeId;
  }
  if (choices.isField && choices.isOptional) {
    const wrapperShapeId = currentSpecContext.domainIds.newShapeId();
    newCommands.push(
      ...[
        AddShape(wrapperShapeId, ICoreShapeKinds.OptionalKind.toString(), ''),
        SetParameterShape(
          ProviderInShape(
            wrapperShapeId,
            ShapeProvider(rootShapeId),
            ICoreShapeInnerParameterNames.OptionalInner
          )
        ),
      ]
    );

    rootShapeId = wrapperShapeId;
  }

  return { rootShapeId, commands: newCommands };
}
