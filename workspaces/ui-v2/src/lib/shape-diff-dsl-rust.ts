import {
  IJsonObjectKey,
  IJsonTrail,
  normalize,
} from '@useoptic/cli-shared/build/diffs/json-trail';
import sortBy from 'lodash.sortby';
import equals from 'lodash.isequal';
import { IShapeTrail } from '@useoptic/cli-shared/build/diffs/shape-trail';
import { CurrentSpecContext, ICoreShapeKinds } from './Interfaces';
import {
  IExpectationHelper,
  shapeTrailParserLastId,
} from './shape-trail-parser';
import {
  IValueAffordanceSerialization,
  IValueAffordanceSerializationWithCounter,
} from '../../../cli-shared/build/diffs/initial-types';
import invariant from 'invariant';
import { namer } from './quick-namer';
import { setDifference } from '<src>/lib/set-ops';

export async function getExpectationsForShapeTrail(
  shapeTrail: IShapeTrail,
  jsonTrail: IJsonTrail,
  spectacle: any,
  currentSpecContext: CurrentSpecContext
): Promise<Expectation> {
  const expectations = await shapeTrailParserLastId(shapeTrail, spectacle);
  return new Expectation(
    expectations,
    currentSpecContext,
    shapeTrail,
    jsonTrail
  );
}

export class Expectation {
  public expectationsFromSpec: IExpectationHelper;
  private currentSpecContext: CurrentSpecContext;

  constructor(
    expectationsFromSpec: IExpectationHelper,
    currentSpecContext: CurrentSpecContext,
    private shapeTrail: IShapeTrail,
    private jsonTrail: IJsonTrail
  ) {
    this.expectationsFromSpec = expectationsFromSpec;
    this.currentSpecContext = currentSpecContext;
  }

  isListItemShape(): boolean {
    return Boolean(this.expectationsFromSpec.lastListItem);
  }

  lastListItem(): string {
    return this.expectationsFromSpec.lastListItem!;
  }

  rootShapeId(): string {
    return this.expectationsFromSpec.rootShapeId!;
  }

  lastList(): string {
    return this.expectationsFromSpec.lastList!;
  }

  isField(): boolean {
    return !!this.expectationsFromSpec.lastField;
  }

  aRequiredField(): boolean {
    return this.isField() && !this.isOptionalField();
  }

  lastObject(): string {
    invariant(
      this.expectationsFromSpec.lastObject,
      'parent object shapeId not found'
    );
    return this.expectationsFromSpec.lastObject;
  }

  isOptionalField(): boolean {
    invariant(this.isField(), 'shape trail is not a field.');
    return this.expectationsFromSpec.fieldIsOptional || false;
  }

  fieldKey(): string {
    invariant(this.isField(), 'shape trail is not a field.');
    const lastJsonTrail = this.jsonTrail.path[this.jsonTrail.path.length - 1];
    invariant(
      lastJsonTrail.hasOwnProperty('JsonObjectKey'),
      'expected a json trail for a field'
    );
    const name = (lastJsonTrail as IJsonObjectKey).JsonObjectKey.key;
    return name;
  }

  fieldShapeId(): string {
    invariant(this.isField(), 'shape trail is not a field.');
    return this.expectationsFromSpec.lastFieldShapeId!;
  }

  fieldId(): string | undefined {
    return this.expectationsFromSpec.lastField;
  }

  shapeName(): string {
    this.expectedShapes();
    return namer(Array.from(this.expectedShapes()));
  }

  expectedShapes(): Set<ICoreShapeKinds> {
    return new Set(
      this.expectationsFromSpec.allowedCoreShapes.map(
        (i) => i as ICoreShapeKinds
      )
    );
  }

  allowedCoreShapeKindsByShapeId(): { [key: string]: ICoreShapeKinds } {
    return this.expectationsFromSpec.allowedCoreShapeKindsByShapeId;
  }

  // this tells us which (if any) shapes were observed at trail that weren't expected
  // ie expects [string, number]. If this returns [], nothing more than [string, number] observed
  // if this return [list, nullable], that means it's also been a list and null.
  diffActual: (actual: Actual) => ICoreShapeKinds[] = (actual: Actual) => {
    const a = this.expectedShapes();
    const b = actual.observedCoreShapeKinds();
    return Array.from(b).filter((x) => !a.has(x));
  };

  unionWithActual: (actual: Actual) => ICoreShapeKinds[] = (actual: Actual) => {
    const a = this.expectedShapes();
    const b = actual.observedCoreShapeKinds();
    return Array.from(new Set([...Array.from(a), ...Array.from(b)]));
  };

  // build the command helpers
  fieldChangeHelper(actual: Actual) {
    // return new FieldContextSpecChange(this, actual, this.currentSpecContext);
  }
}

export class Actual {
  public trailAffordances: IValueAffordanceSerialization[];

  constructor(
    public learnedTrails: IValueAffordanceSerializationWithCounter,
    private shapeTrail: IShapeTrail,
    public jsonTrail: IJsonTrail
  ) {
    this.trailAffordances = learnedTrails.affordances.filter((i) => {
      const compared = equals(normalize(i.trail), normalize(jsonTrail));
      return compared;
    });
  }

  isField(): boolean {
    return Boolean(this.fieldKey());
  }

  fieldKey(): string | undefined {
    const jsonTrailLast = this.jsonTrail.path[this.jsonTrail.path.length - 1];
    const last =
      jsonTrailLast && jsonTrailLast.hasOwnProperty('JsonObjectKey')
        ? (jsonTrailLast as IJsonObjectKey).JsonObjectKey
        : undefined;
    if (last) {
      return last.key;
    }
  }

  observedCoreShapeKinds(): Set<ICoreShapeKinds> {
    const kinds: Set<ICoreShapeKinds> = new Set([]);

    if (this.wasString()) kinds.add(ICoreShapeKinds.StringKind);
    if (this.wasNumber()) kinds.add(ICoreShapeKinds.NumberKind);
    if (this.wasBoolean()) kinds.add(ICoreShapeKinds.BooleanKind);
    if (this.wasNull()) kinds.add(ICoreShapeKinds.NullableKind);
    if (this.wasArray()) kinds.add(ICoreShapeKinds.ListKind);
    if (this.wasObject()) kinds.add(ICoreShapeKinds.ObjectKind);

    return kinds;
  }

  interactionsGroupedByCoreShapeKind(): IInteractionsGroupedByCoreShapeKind {
    const results: IInteractionsGroupedByCoreShapeKind = [];

    const {
      wasMissing,
      wasNumber,
      wasBoolean,
      wasNull,
      wasArray,
      wasObject,
      wasString,
      wasEmptyArray,
      wasMissingTrails,
      wasNumberTrails,
      wasBooleanTrails,
      wasNullTrails,
      wasArrayTrails,
      wasObjectTrails,
      wasStringTrails,
    } = this.learnedTrails.interactions;

    if (wasMissing.length)
      results.push({
        label: 'missing',
        kind: ICoreShapeKinds.OptionalKind,
        interactions: wasMissing,
        jsonTrailsByInteractions: wasMissingTrails,
      });
    if (wasString.length)
      results.push({
        label: 'string',
        kind: ICoreShapeKinds.StringKind,
        interactions: wasString,
        jsonTrailsByInteractions: wasStringTrails,
      });
    if (wasNumber.length)
      results.push({
        label: 'number',
        kind: ICoreShapeKinds.NumberKind,
        interactions: wasNumber,
        jsonTrailsByInteractions: wasNumberTrails,
      });
    if (wasBoolean.length)
      results.push({
        label: 'boolean',
        kind: ICoreShapeKinds.BooleanKind,
        interactions: wasBoolean,
        jsonTrailsByInteractions: wasBooleanTrails,
      });
    if (wasNull.length)
      results.push({
        label: 'null',
        kind: ICoreShapeKinds.NullableKind,
        interactions: wasNull,
        jsonTrailsByInteractions: wasNullTrails,
      });
    if (wasArray.length || wasEmptyArray.length) {
      const wasArraySet = new Set([...wasArray]);
      const wasEmptyArraySet = new Set([...wasEmptyArray]);
      const wasArrayWithItems = setDifference(wasArraySet, wasEmptyArraySet);

      results.push({
        label: 'list',
        kind: ICoreShapeKinds.ListKind,
        interactions:
          wasArrayWithItems.size > 0 ? Array.from(wasArrayWithItems) : wasArray,
        jsonTrailsByInteractions: wasArrayTrails,
      });
    }
    if (wasObject.length)
      results.push({
        label: 'object',
        kind: ICoreShapeKinds.ObjectKind,
        interactions: wasObject,
        jsonTrailsByInteractions: wasObjectTrails,
      });

    //sort it by the most common variants
    return sortBy(results, (i) => i.interactions.length).reverse();
  }

  //special case, won't ever show up in the affordances
  wasMissing: () => boolean = () =>
    this.learnedTrails.interactions.wasMissing.length > 0;

  //answers was this ever a ____
  wasString: () => boolean = () =>
    this.trailAffordances.some((i) => i.wasString);
  wasNumber: () => boolean = () =>
    this.trailAffordances.some((i) => i.wasNumber);
  wasBoolean: () => boolean = () =>
    this.trailAffordances.some((i) => i.wasBoolean);
  wasNull: () => boolean = () => this.trailAffordances.some((i) => i.wasNull);
  wasArray: () => boolean = () => this.trailAffordances.some((i) => i.wasArray);
  wasObject: () => boolean = () =>
    this.trailAffordances.some((i) => i.wasObject);
}

type IInteractionsGroupedByCoreShapeKind = {
  label: string;
  kind: ICoreShapeKinds;
  interactions: string[];
  jsonTrailsByInteractions: { [key: string]: IJsonTrail[] };
}[];
