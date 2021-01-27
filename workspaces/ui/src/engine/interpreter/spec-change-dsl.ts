import { Actual, Expectation } from './shape-diff-dsl';
import invariant from 'invariant';
import { JsonHelper, opticEngine, OpticIds, toOption } from '@useoptic/domain';
import {
  ICoreShapeInnerParameterNames,
  ICoreShapeKinds,
} from '../interfaces/interfaces';
import { setDifference, setIntersection, setUnion } from '../set-ops';
import { DiffRfcBaseState } from '@useoptic/cli-shared/build/diffs/diff-rfc-base-state';

const LearnJsonTrailAffordances = opticEngine.com.useoptic.diff.interactions.interpreters.distribution_aware.LearnJsonTrailAffordances();

// For fields we use only these commands

export class FieldContextSpecChange {
  private fieldId: string;
  private innerShapeId: string;

  private shouldMakeRequired: boolean = false;
  private shouldRemoveField: boolean = false;
  private shouldMakeOptional: boolean = false;
  private shapeChanges: IShapeChange = {
    add: new Set([]),
    remove: new Set([]),
    wrapNullable: false,
  };

  constructor(
    private expectation: Expectation,
    private actual: Actual,
    private rfcBaseState: DiffRfcBaseState
  ) {
    invariant(expectation.isField(), 'must be a field');
    this.fieldId = expectation.fieldId()!!;
    this.innerShapeId = expectation.fieldShapeId()!!;
  }

  changeShape(changes: IShapeChange) {
    this.shapeChanges = changes;
    return this;
  }

  wrapInOptional() {
    if (!this.expectation.isOptionalField()) this.shouldMakeOptional = true;
    return this;
  }

  makeRequired() {
    this.shouldMakeRequired = true;
    return this;
  }

  stageFieldRemoval() {
    this.shouldRemoveField = true;
    return this;
  }

  private wrapInNullableIfNeeded({
    commands,
    fieldInnerShapeId,
  }: {
    commands: any[];
    fieldInnerShapeId: string;
  }): { commands: any[]; fieldInnerShapeId: string } {
    const ids = this.rfcBaseState.domainIdGenerator;
    const shouldWrap =
      this.shapeChanges.wrapNullable &&
      this.expectation
        .unionWithActual(this.actual)
        .some((i) => ICoreShapeKinds.NullableKind);

    if (shouldWrap) {
      const newCommands = [];
      const wrapperShapeId = ids.newShapeId();
      const {
        AddShape,
        SetParameterShape,
        ProviderInShape,
        ShapeProvider,
      } = opticEngine.com.useoptic.contexts.shapes.Commands;
      newCommands.push(
        AddShape(wrapperShapeId, ICoreShapeKinds.NullableKind.toString(), ''),
        SetParameterShape(
          ProviderInShape(
            wrapperShapeId,
            ShapeProvider(fieldInnerShapeId),
            ICoreShapeInnerParameterNames.NullableInner
          )
        )
      );
      return {
        commands: [...commands, ...newCommands],
        fieldInnerShapeId: wrapperShapeId,
      };
    } else {
      return { commands: commands, fieldInnerShapeId: fieldInnerShapeId };
    }
  }

  private getMostInnerShapeId(): {
    commands: any[];
    fieldInnerShapeId: string;
  } {
    if (this.hasShapeChanges()) {
      const {
        newCommands,
        addedMapping,
        targetFinal,
        existingShapeIdsForTypes,
      } = reduceShapeChangesToCommandsAndMappings(
        this.shapeChanges,
        this.expectation,
        this.actual,
        this.rfcBaseState
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
            fieldInnerShapeId: hasExistingShapeId!,
          };
        } else {
          const newShapeId: string | undefined = addedMapping[oneKind];
          invariant(
            Boolean(newShapeId),
            'new shapes created by the helper, should have ids'
          );
          return { commands: newCommands, fieldInnerShapeId: newShapeId! };
        }
      } else if (targetFinal.size > 1) {
        const ids = this.rfcBaseState.domainIdGenerator;
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

        return { commands: newCommands, fieldInnerShapeId: oneOfWrapperShape };
      }
    } else {
      //nothing changes
      return {
        commands: [],
        fieldInnerShapeId: this.expectation.fieldShapeId()!,
      }; // whatever it was before stays
    }
  }

  private hasShapeChanges() {
    return this.shapeChanges.add.size > 0 || this.shapeChanges.remove.size > 0;
  }

  toCommands(): any[] {
    const ids = this.rfcBaseState.domainIdGenerator;

    const defaultMostInner = this.getMostInnerShapeId();
    // order of shapes primitive, oneOf, nullable, optional (provided below)
    const innerShape = this.wrapInNullableIfNeeded(defaultMostInner);
    // might be the same fieldShapeId as before, could be different
    const fieldInnerShapeId = innerShape.fieldInnerShapeId;
    //seed these with commands needed to build/modify the inner shape
    const commands = [...innerShape.commands];

    const {
      AddShape,
      SetParameterShape,
      ProviderInShape,
      ShapeProvider,
      SetFieldShape,
      FieldShapeFromShape,
      RemoveField,
    } = opticEngine.com.useoptic.contexts.shapes.Commands;

    if (
      this.shouldMakeOptional || // if user chose optional, wrap
      (this.expectation.isOptionalField() && // if it's already optional and hasn't been removed or made required, warp optional
        !(this.shouldMakeRequired || this.shouldRemoveField))
    ) {
      const wrapperShapeId = ids.newShapeId();
      commands.push(
        AddShape(wrapperShapeId, ICoreShapeKinds.OptionalKind.toString(), ''),
        SetParameterShape(
          ProviderInShape(
            wrapperShapeId,
            ShapeProvider(fieldInnerShapeId),
            ICoreShapeInnerParameterNames.OptionalInner
          )
        ),
        SetFieldShape(FieldShapeFromShape(this.fieldId, wrapperShapeId))
      );
    } else if (this.shouldRemoveField) {
      commands.push(RemoveField(this.fieldId));
    } else if (this.shouldMakeRequired || this.hasShapeChanges()) {
      commands.push(
        SetFieldShape(FieldShapeFromShape(this.fieldId, fieldInnerShapeId))
      );
    }

    return serializeCommands(commands);
  }
}

export function addNewFieldCommands(
  key: string,
  expected: Expectation,
  actual: Actual,
  optional: boolean
): { name: string; asRequiredCommands: any[]; asOptionalCommands: any[] } {
  const newCommands = [];

  const ids = expected.rfcBaseState.domainIdGenerator;

  const parentObjectId = expected.lastObject();

  const { rootShapeId, name, commands } = JsonHelper.toJs(
    LearnJsonTrailAffordances.toCommandsJson(
      JSON.stringify(actual.learnedTrails.affordances),
      JSON.stringify(actual.jsonTrail),
      ids,
      toOption('')
    )
  );
  const scalaCommands = JsonHelper.seqToJsArray(
    opticEngine.CommandSerialization.fromJs(commands)
  );

  newCommands.push(...scalaCommands);

  const {
    AddField,
    FieldShapeFromShape,
    AddShape,
    SetParameterShape,
    ProviderInShape,
    ShapeProvider,
    SetFieldShape,
  } = opticEngine.com.useoptic.contexts.shapes.Commands;

  const fieldId = ids.newFieldId();

  newCommands.push(
    AddField(
      fieldId,
      parentObjectId,
      key,
      FieldShapeFromShape(fieldId, rootShapeId)
    )
  );

  const asOptionalCommands = [...newCommands];
  if (optional) {
    const wrapperShapeId = ids.newShapeId();
    asOptionalCommands.push(
      AddShape(wrapperShapeId, ICoreShapeKinds.OptionalKind.toString(), ''),
      SetParameterShape(
        ProviderInShape(
          wrapperShapeId,
          ShapeProvider(rootShapeId),
          ICoreShapeInnerParameterNames.OptionalInner
        )
      ),
      SetFieldShape(FieldShapeFromShape(fieldId, wrapperShapeId))
    );
  }

  return {
    name,
    asRequiredCommands: serializeCommands(newCommands),
    asOptionalCommands: serializeCommands(asOptionalCommands),
  };
}

export interface IShapeChange {
  add: Set<ICoreShapeKinds>;
  remove: Set<ICoreShapeKinds>;
  wrapNullable: boolean;
}

export function serializeCommands(commands: any[]): any[] {
  return opticEngine.CommandSerialization.toJs(
    JsonHelper.jsArrayToVector(commands)
  );
}

export function reduceShapeChangesToCommandsAndMappings(
  shapeChange: IShapeChange,
  expected: Expectation,
  actual: Actual,
  rfcBaseState: DiffRfcBaseState
): {
  addedMapping: { [key: string]: string };
  newCommands: any[];
  targetFinal: Set<ICoreShapeKinds>;
  existingShapeIdsForTypes: { [p: string]: ICoreShapeKinds };
} {
  const combined = setUnion(shapeChange.add, expected.expectedShapes());
  const targetFinal: Set<ICoreShapeKinds> = setDifference(
    combined,
    shapeChange.remove
  );

  targetFinal.delete(ICoreShapeKinds.OptionalKind);
  targetFinal.delete(ICoreShapeKinds.NullableKind);

  if (shapeChange.add.size > 0 || shapeChange.remove.size > 0) {
    const existingShapeIdsForTypes = expected.allowedCoreShapeKindsByShapeId();

    let newCommands = [];
    const addedMapping: { [key: string]: string } = {};
    shapeChange.add.forEach((shapeToGenerate) => {
      if (
        shapeToGenerate === ICoreShapeKinds.NullableKind ||
        shapeToGenerate === ICoreShapeKinds.OptionalKind
      ) {
        return;
      }

      const { rootShapeId, commands } = JsonHelper.toJs(
        LearnJsonTrailAffordances.toCommandsJson(
          JSON.stringify(actual.learnedTrails.affordances),
          JSON.stringify(actual.jsonTrail),
          rfcBaseState.domainIdGenerator,
          toOption(shapeToGenerate)
        )
      );

      const scalaCommands = JsonHelper.seqToJsArray(
        opticEngine.CommandSerialization.fromJs(commands)
      );
      newCommands.push(...scalaCommands);
      addedMapping[shapeToGenerate] = rootShapeId;
    });

    return { newCommands, targetFinal, existingShapeIdsForTypes, addedMapping };
  } else {
    return {
      newCommands: [],
      targetFinal,
      existingShapeIdsForTypes: expected.allowedCoreShapeKindsByShapeId(),
      addedMapping: {},
    };
  }
}
