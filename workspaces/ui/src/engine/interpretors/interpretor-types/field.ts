import { BodyShapeDiff } from '../../parse-diff';
import { Actual, Expectation } from '../shape-diff-dsl';
import {
  code,
  IChangeType,
  IInterpretation,
  ISuggestion,
  plain,
} from '../../interfaces/interpretors';
import { ICoreShapeKinds } from '../../interfaces/interfaces';
import { DiffRfcBaseState } from '../../interfaces/diff-rfc-base-state';
import { IObjectFieldTrail, IShapeTrail } from '../../interfaces/shape-trail';
import {
  IJsonObjectKey,
  IJsonTrail,
} from '@useoptic/cli-shared/build/diffs/json-trail';
import { IValueAffordanceSerializationWithCounter } from '@useoptic/cli-shared/build/diffs/initial-types';
import { JsonHelper, opticEngine } from '@useoptic/domain';
import { InteractiveSessionConfig } from '../../interfaces/session';

const LearnJsonTrailAffordances = opticEngine.com.useoptic.diff.interactions.interpreters.distribution_aware.LearnJsonTrailAffordances();

export function fieldShapeDiffInterpretor(
  shapeDiff: BodyShapeDiff,
  actual: Actual,
  expected: Expectation,
  services: InteractiveSessionConfig
): IInterpretation {
  const { shapeTrail, jsonTrail } = shapeDiff;
  const isUnmatched = shapeDiff.isUnmatched;
  const isUnspecified = shapeDiff.isUnspecified;

  const present = new FieldShapeInterpretationHelper(
    services.rfcBaseState,
    shapeTrail,
    jsonTrail,
    actual.learnedTrails,
    actual,
    expected
  );

  // field is in the spec, the value was not what we expected to see
  if (isUnmatched) {
    const expectsARequiredField =
      expected.isField() && !expected.isOptionalField;
    const unexpectedShapesObserved = expected.diffActual(actual);
    const observedShapeDidNotMatch = unexpectedShapesObserved.length > 0;

    if (actual.wasMissing && expectsARequiredField) {
      present.askMakeOptional();
      present.askRemoveField();
    }

    if (observedShapeDidNotMatch) {
      present.addAdditionalCoreShapeKinds(unexpectedShapesObserved);
    }
  }

  // we've already check if isField() is true, so this is always add field
  if (isUnspecified) {
    const key = (jsonTrail.path[jsonTrail.path.length - 1] as IJsonObjectKey)
      .JsonObjectKey.key;
    present.askAddField(key);
  }

  return present.flush();
}

class FieldShapeInterpretationHelper {
  private shouldAskMakeOptional = false;
  private shouldAskAddField: string | undefined = undefined;
  private shouldAskToRemoveField = false;
  private additionalCoreShapeKinds: ICoreShapeKinds[] = [];
  constructor(
    private rfcBaseState: DiffRfcBaseState,
    private shapeTrail: IShapeTrail,
    private jsonTrail: IJsonTrail,
    private learnedTrails: IValueAffordanceSerializationWithCounter,
    private actual: Actual,
    private expected: Expectation
  ) {}

  askAddField = (key: string) => (this.shouldAskAddField = key);
  askMakeOptional = () => (this.shouldAskMakeOptional = true);
  askRemoveField = () => (this.shouldAskToRemoveField = true);
  addAdditionalCoreShapeKinds = (kinds: ICoreShapeKinds[]) =>
    (this.additionalCoreShapeKinds = kinds);

  flush(): IInterpretation {
    const suggestions: ISuggestion[] = [];

    ///////////////////////////////////////////////////////////////
    // Catch New fields first
    if (typeof this.shouldAskAddField !== 'undefined') {
      return this.addNewField(this.shouldAskAddField!);
    }
    ///////////////////////////////////////////////////////////////

    // this happens first, (if changes required), and is shared through all the cases.
    const updateShapeCommands = this.generateCommandsToChangeShape();

    if (
      this.additionalCoreShapeKinds.length > 0 &&
      !this.actual.wasMissing() /* when missing, change shape commands are gets included in the optional/required commands  */
    ) {
      suggestions.push(this.changeFieldShape(updateShapeCommands));
    }

    if (this.shouldAskMakeOptional) {
      suggestions.push(this.wrapFieldShapeWithOptional(updateShapeCommands));
    }
    if (this.shouldAskToRemoveField) {
      suggestions.push(this.removeField(updateShapeCommands));
    }

    return { suggestions, previewTabs: [] };
  }

  ///////////////////////////////////////////////////////////////////

  private generateCommandsToChangeShape(): any[] {
    return [];
  }

  private wrapFieldShapeWithOptional(shapeChangeCommands: any[]): ISuggestion {
    const key = this.expected.fieldKey();
    const sharedCopy = [
      plain('field'),
      code(key),
      plain('as optional'),
      code(this.expected.shapeName()),
    ];

    return {
      action: {
        activeTense: [plain('mark'), ...sharedCopy],
        pastTense: [plain('Marked'), ...sharedCopy],
      },
      commands: [],
      changeType: IChangeType.Changed,
    };
  }

  private removeField(shapeChangeCommands: any[]): ISuggestion {
    const key = this.expected.fieldKey();
    const sharedCopy = [plain('field'), code(key)];

    return {
      action: {
        activeTense: [plain('remove'), ...sharedCopy],
        pastTense: [plain('Removed'), ...sharedCopy],
      },
      commands: [],
      changeType: IChangeType.Removed,
    };
  }

  private changeFieldShape(updateShapeCommands: any[]) {
    const key = this.expected.fieldKey();
    const sharedCopy = [
      plain('shape of'),
      code(key),
      plain('to'),
      code(this.additionalCoreShapeKinds.join(', ')), // @todo change me to proper format
    ];

    return {
      action: {
        activeTense: [plain('change'), ...sharedCopy],
        pastTense: [plain('Changed'), ...sharedCopy],
      },
      commands: [],
      changeType: IChangeType.Changed,
    };
  }

  private addNewField(key: string): IInterpretation {
    const parentId = this.expected.lastObject!;

    // commands for the field value. infer'd poly.
    const { rootShapeId, commands } = JsonHelper.toJs(
      LearnJsonTrailAffordances.toCommandsJson(
        JSON.stringify(this.actual.learnedTrails.affordances),
        JSON.stringify(this.jsonTrail)
      )
    );

    const sharedCopy = [code(key), plain('as'), code('$type here')];

    const suggestOptionalFirst = this.actual.wasMissing();

    const tabs: IInteractionPreviewTab[] = this.actual
      .interactionsGroupedByCoreShapeKind()
      .map((shapeGrouping) => {
        return {
          interactionPointers: shapeGrouping.interactions,
          title: shapeGrouping.label,
          allowsExpand: true,
          renderBody: async (a) => {},
        };
      });

    const suggestions = [
      {
        action: {
          activeTense: [plain('add required field'), ...sharedCopy],
          pastTense: [plain('Added required field'), ...sharedCopy],
        },
        commands: [],
        changeType: IChangeType.Added,
      },
      {
        action: {
          activeTense: [plain('add optional field'), ...sharedCopy],
          pastTense: [plain('Added optional field'), ...sharedCopy],
        },
        commands: [],
        changeType: IChangeType.Added,
      },
    ];

    return {
      suggestions: suggestOptionalFirst ? suggestions.reverse() : suggestions,
      previewTabs: tabs,
    };
  }
}
