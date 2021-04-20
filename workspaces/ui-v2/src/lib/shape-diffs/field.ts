import { BodyShapeDiff } from '../parse-diff';
import { Actual, Expectation } from '../shape-diff-dsl-rust';
import sortBy from 'lodash.sortby';
import {
  CurrentSpecContext,
  ICoreShapeKinds,
  IDiffDescription,
  IInteractionPreviewTab,
  IInterpretation,
  IPatchChoices,
} from '../Interfaces';
import { IShapeTrail } from '../../../../cli-shared/build/diffs/shape-trail';
import { IJsonTrail } from '../../../../cli-shared/build/diffs/json-trail';
import { IValueAffordanceSerializationWithCounter } from '../../../../cli-shared/build/diffs/initial-types';
import { code, plain } from '../../optic-components/diffs/render/ICopyRender';
import { builderInnerShapeFromChoices } from './build-inner-shape';
import {
  AddField,
  FieldShapeFromShape,
  SetFieldShape,
} from '../command-factory';

export function fieldShapeDiffInterpreter(
  shapeDiff: BodyShapeDiff,
  actual: Actual,
  expected: Expectation,
  diffDescription: IDiffDescription,
  currentSpecContext: CurrentSpecContext,
): IInterpretation {
  const { shapeTrail, jsonTrail } = shapeDiff;
  const isUnmatched = shapeDiff.isUnmatched;
  const isUnspecified = shapeDiff.isUnspecified;

  const present = new FieldShapeInterpretationHelper(
    shapeDiff.diffHash(),
    shapeTrail,
    jsonTrail,
    actual.learnedTrails,
    actual,
    expected,
    diffDescription,
  );

  let updateSpecChoices: IPatchChoices = {
    copy: [],
    shapes: [],
    isField: true,
  };

  // field is in the spec, the value was not what we expected to see
  if (isUnmatched) {
    const unexpectedShapesObserved = expected.diffActual(actual);
    const observedShapeDidNotMatch = unexpectedShapesObserved.length > 0;

    if (actual.wasMissing() && expected.aRequiredField()) {
      updateSpecChoices.copy = [
        plain('what values are allowed for'),
        code(actual.fieldKey()!),
      ];
      updateSpecChoices.isOptional = true;
      updateSpecChoices.shapes = sortBy(
        expected.unionWithActual(actual).map((i) => {
          return {
            coreShapeKind: i,
            isValid: expected.expectedShapes().has(i),
          };
        }),
        'isValid',
      );
      // present.askMakeOptional();
      // present.askRemoveField();
    } else if (observedShapeDidNotMatch) {
      updateSpecChoices.copy = [code(actual.fieldKey()!), plain('can be a')];
      updateSpecChoices.isOptional = !expected.aRequiredField();
      updateSpecChoices.shapes = sortBy(
        expected.unionWithActual(actual).map((i) => {
          return {
            coreShapeKind: i,
            isValid: true,
          };
        }),
        'isValid',
      );

      // present.addAdditionalCoreShapeKinds(unexpectedShapesObserved);
    }
  }
  // we've already check if isField() is true, so this is always add field
  if (isUnspecified) {
    updateSpecChoices.shapes = sortBy(
      Array.from(actual.observedCoreShapeKinds()).map((i) => {
        return {
          coreShapeKind: i,
          isValid: true,
        };
      }),
      'isValid',
    );
  }

  return {
    previewTabs: present.createPreviews().reverse(),
    diffDescription,
    toCommands(choices: IPatchChoices): any[] {
      if (isUnmatched) {
        const { commands, rootShapeId } = builderInnerShapeFromChoices(
          choices,
          expected,
          actual,
          currentSpecContext,
        );

        return [
          ...commands,
          SetFieldShape(FieldShapeFromShape(expected.fieldId()!, rootShapeId)),
        ];
      } else if (isUnspecified) {
        const fieldId = currentSpecContext.domainIds.newFieldId();
        const { commands, rootShapeId } = builderInnerShapeFromChoices(
          choices,
          expected,
          actual,
          currentSpecContext,
        );

        const lastObject = expected.lastObject();

        return [
          ...commands,
          AddField(
            fieldId,
            lastObject,
            actual.fieldKey()!,
            FieldShapeFromShape(fieldId, rootShapeId),
          ),
        ];
      }
      return [];
    },
    updateSpecChoices,
  };

  // return present.flush();
}

class FieldShapeInterpretationHelper {
  private additionalCoreShapeKinds: ICoreShapeKinds[] = [];
  constructor(
    private diffHash: string,
    private shapeTrail: IShapeTrail,
    private jsonTrail: IJsonTrail,
    private learnedTrails: IValueAffordanceSerializationWithCounter,
    private actual: Actual,
    private expected: Expectation,
    private diffDescription: IDiffDescription,
  ) {}

  ///////////////////////////////////////////////////////////////////

  public createPreviews(): IInteractionPreviewTab[] {
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

    return orderTabs(false, previews);
  }
}

function orderTabs(newField: boolean, tabs: IInteractionPreviewTab[]) {
  const ordering = {
    missing: 10,
  };

  return tabs.sort((a, b) => {
    // @ts-ignore
    const aI = ordering[a.title] || 0;
    // @ts-ignore
    const bI = ordering[b.title] || 0;

    if (aI > bI) {
      return 1;
    } else {
      return -1;
    }
  });
}
