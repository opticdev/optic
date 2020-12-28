import { BodyShapeDiff, ParsedDiff } from '../../parse-diff';
import { Actual, Expectation } from '../shape-diff-dsl';
import {
  code,
  IChangeType,
  ICopy,
  IInteractionPreviewTab,
  IInterpretation,
  ISuggestion,
  plain,
} from '../../interfaces/interpretors';
import { ICoreShapeKinds } from '../../interfaces/interfaces';
import { DiffRfcBaseState } from '../../interfaces/diff-rfc-base-state';
import { IObjectFieldTrail, IShapeTrail } from '../../interfaces/shape-trail';
import flatten from 'lodash.flatten';
import {
  IJsonObjectKey,
  IJsonTrail,
} from '@useoptic/cli-shared/build/diffs/json-trail';
import { IValueAffordanceSerializationWithCounter } from '@useoptic/cli-shared/build/diffs/initial-types';
import { JsonHelper, opticEngine, toOption } from '@useoptic/domain';
import { InteractiveSessionConfig } from '../../interfaces/session';
import { Simulate } from 'react-dom/test-utils';
import sortBy from 'lodash.sortby';
import { addNewFieldCommands, IShapeChange } from '../spec-change-dsl';
import { setDifference, setEquals } from '../../set-ops';
import { nameForCoreShapeKind, namerForOneOf } from '../quick-namer';
import { targetKindSuggestion } from '../target-shape-kind';

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
    shapeDiff.diffHash(),
    services.rfcBaseState,
    shapeTrail,
    jsonTrail,
    actual.learnedTrails,
    actual,
    expected
  );

  // field is in the spec, the value was not what we expected to see
  if (isUnmatched) {
    const unexpectedShapesObserved = expected.diffActual(actual);
    const observedShapeDidNotMatch = unexpectedShapesObserved.length > 0;

    if (actual.wasMissing() && expected.aRequiredField()) {
      present.askMakeOptional();
      present.askRemoveField();
    }

    if (observedShapeDidNotMatch) {
      present.addAdditionalCoreShapeKinds(unexpectedShapesObserved);
    }
  }

  // we've already check if isField() is true, so this is always add field
  if (isUnspecified) {
    present.askAddField(actual.fieldKey()!);
  }

  return present.flush();
}

class FieldShapeInterpretationHelper {
  private shouldAskMakeOptional = false;
  private shouldAskAddField: string | undefined = undefined;
  private shouldAskToRemoveField = false;
  private additionalCoreShapeKinds: ICoreShapeKinds[] = [];
  constructor(
    private diffHash: string,
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
    const previewTabs: IInteractionPreviewTab[] = [];

    let overrideTitle: ICopy[] | undefined;
    ///////////////////////////////////////////////////////////////
    // Catch New fields first
    if (typeof this.shouldAskAddField !== 'undefined') {
      return this.addNewField(this.shouldAskAddField!);
    }
    ///////////////////////////////////////////////////////////////

    if (
      this.additionalCoreShapeKinds.length > 0 &&
      !this.actual.wasMissing() /* when missing, change shape commands are gets included in the optional/required commands  */
    ) {
      if (this.expected.isOptionalField()) {
        const {
          shapeChange,
          updatedShapeName,
        } = this.generateChangeShapeInstructions(true);
        suggestions.push(
          this.wrapFieldShapeWithOptional(shapeChange, updatedShapeName)
        );
      }
      suggestions.push(
        this.changeFieldShape(this.generateChangeShapeInstructions(true))
      );

      if (
        !setEquals(
          new Set([...this.expected.unionWithActual(this.actual)]),
          this.actual.observedCoreShapeKinds()
        )
      ) {
        if (this.expected.isOptionalField()) {
          const {
            shapeChange,
            targetFinal,
            updatedShapeName,
          } = this.generateChangeShapeInstructions(false);
          if (targetFinalNotNullable(targetFinal)) {
            suggestions.push(
              this.wrapFieldShapeWithOptional(shapeChange, updatedShapeName)
            );
          }
        }
        //show the breaking one without the union
        const {
          shapeChange,
          targetFinal,
          updatedShapeName,
        } = this.generateChangeShapeInstructions(false);
        if (targetFinalNotNullable(targetFinal))
          suggestions.push(
            this.changeFieldShape({ shapeChange, updatedShapeName })
          );
      }
    }

    const {
      shapeChange,
      updatedShapeName,
    } = this.generateChangeShapeInstructions(true);

    if (this.shouldAskMakeOptional) {
      suggestions.push(
        this.wrapFieldShapeWithOptional(shapeChange, updatedShapeName)
      );
    }
    if (this.shouldAskToRemoveField) {
      suggestions.push(this.removeField());
    }

    //force update the title
    if (
      this.expected.isField() &&
      !this.expected.isOptionalField() &&
      this.actual.wasMissing() &&
      this.additionalCoreShapeKinds.length === 0
    ) {
      overrideTitle = [
        plain('required field'),
        code(this.expected.fieldKey()),
        plain('was missing'),
      ];
    }

    if (
      !this.expected.expectedShapes().has(ICoreShapeKinds.NullableKind) &&
      this.actual.observedCoreShapeKinds().has(ICoreShapeKinds.NullableKind) &&
      this.additionalCoreShapeKinds.length === 1
    ) {
      overrideTitle = [
        plain('the value of'),
        code(this.expected.fieldKey()),
        plain('was null'),
      ];
    }
    return { suggestions, previewTabs: this.createPreviews(), overrideTitle };
  }

  ///////////////////////////////////////////////////////////////////

  private generateChangeShapeInstructions(
    useUnion: boolean
  ): {
    shapeChange: IShapeChange;
    updatedShapeName: ICopy[];
    targetFinal: Set<ICoreShapeKinds>;
  } {
    const result = targetKindSuggestion(useUnion, this.expected, this.actual);
    const isNullable = result.targetFinal.has(ICoreShapeKinds.NullableKind);

    const prependNullable = isNullable ? [code('Nullable')] : [];

    return {
      ...result,
      updatedShapeName: [...prependNullable, ...result.updatedShapeName],
    };
  }

  private createPreviews(): IInteractionPreviewTab[] {
    const previews: IInteractionPreviewTab[] = [];
    const expected = this.expected.expectedShapes();

    const asFieldType =
      this.expected.isField() && !this.expected.isOptionalField()
        ? ' required'
        : '';

    this.actual.interactionsGroupedByCoreShapeKind().forEach((i) => {
      previews.push({
        title: i.label,
        invalid: !expected.has(i.kind),
        allowsExpand: true,
        interactionPointers: i.interactions,
        ignoreRule: {
          diffHash: this.diffHash,
          examplesOfCoreShapeKinds: i.kind,
        },
        assertion: [
          plain('expected' + asFieldType),
          code(this.expected.shapeName()),
        ],
        jsonTrailsByInteractions: i.jsonTrailsByInteractions,
      });
    });
    return sortBy(previews, (i) => !i.invalid);
  }

  private wrapFieldShapeWithOptional(
    shapeChange: IShapeChange,
    updatedName: ICopy[]
  ): ISuggestion {
    const key = this.expected.fieldKey();
    const sharedCopy = [code(key), plain('an optional'), ...updatedName];

    const changeField = this.expected.fieldChangeHelper(this.actual);

    return {
      action: {
        activeTense: [plain('make field'), ...sharedCopy],
        pastTense: [plain('Marked field'), ...sharedCopy],
      },
      commands: changeField
        .changeShape(shapeChange) // may be empty :)
        .wrapInOptional()
        .toCommands(),
      changeType: IChangeType.Changed,
    };
  }

  private removeField(): ISuggestion {
    const key = this.expected.fieldKey();
    const sharedCopy = [code(key)];

    const changeField = this.expected.fieldChangeHelper(this.actual);

    return {
      action: {
        activeTense: [plain('remove field'), ...sharedCopy],
        pastTense: [plain('Removed field'), ...sharedCopy],
      },
      commands: changeField.stageFieldRemoval().toCommands(),
      changeType: IChangeType.Removed,
    };
  }

  private changeFieldShape({
    shapeChange,
    updatedShapeName,
  }: {
    shapeChange: IShapeChange;
    updatedShapeName: ICopy[];
  }) {
    const key = this.expected.fieldKey();

    const sharedCopy = [code(key), plain('a required'), ...updatedShapeName];
    const changeField = this.expected.fieldChangeHelper(this.actual);

    return {
      action: {
        activeTense: [plain('make field'), ...sharedCopy],
        pastTense: [plain('Marked field'), ...sharedCopy],
      },
      commands: changeField
        .changeShape(shapeChange)
        .makeRequired()
        .toCommands(),
      changeType: IChangeType.Changed,
    };
  }

  private addNewField(key: string): IInterpretation {
    const {
      name,
      asRequiredCommands,
      asOptionalCommands,
    } = addNewFieldCommands(key, this.expected, this.actual, true);

    const sharedCopy = [code(key), plain('as'), code(name)];

    const suggestOptionalFirst = this.actual.wasMissing();

    const tabs: IInteractionPreviewTab[] = this.actual
      .interactionsGroupedByCoreShapeKind()
      .map((shapeGrouping) => {
        return {
          interactionPointers: shapeGrouping.interactions,
          title: shapeGrouping.label,
          allowsExpand: true,
          invalid: true,
          ignoreRule: {
            diffHash: this.diffHash,
            examplesOfCoreShapeKinds: shapeGrouping.kind,
          },
          assertion: [plain('undocumented field'), code(key)],
          jsonTrailsByInteractions: shapeGrouping.jsonTrailsByInteractions,
        };
      });

    const suggestions = [
      {
        action: {
          activeTense: [plain('add required field'), ...sharedCopy],
          pastTense: [plain('Added required field'), ...sharedCopy],
        },
        commands: asRequiredCommands,
        changeType: IChangeType.Added,
      },
      {
        action: {
          activeTense: [plain('add optional field'), ...sharedCopy],
          pastTense: [plain('Added optional field'), ...sharedCopy],
        },
        commands: asOptionalCommands,
        changeType: IChangeType.Added,
      },
    ];

    return {
      suggestions: suggestOptionalFirst ? suggestions.reverse() : suggestions,
      previewTabs: tabs,
    };
  }
}

const targetFinalNotNullable = (target: Set<ICoreShapeKinds>) =>
  !(target.has(ICoreShapeKinds.NullableKind) && target.size === 1);
