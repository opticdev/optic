import { IJsonTrail } from './json-trail';

export interface ILearnedBodies {
  pathId: string;
  method: string;
  requests: ILearnedBody[];
  responses: ILearnedBody[];
}

export interface ILearnedBody {
  contentType: string;
  statusCode?: number;
  commands: any[];
  rootShapeId: string;
}

export interface IValueAffordanceSerializationWithCounter {
  affordances: IValueAffordanceSerialization[];
  interactions: IAffordanceInteractionPointers;
}

export interface IValueAffordanceSerializationWithCounterGroupedByDiffHash {
  [key: string]: IValueAffordanceSerializationWithCounter;
}

export interface IValueAffordanceSerialization {
  trail: IJsonTrail;
  wasString: boolean;
  wasNumber: boolean;
  wasBoolean: boolean;
  wasNull: boolean;
  wasArray: boolean;
  wasObject: boolean;
  fieldSet: string[][];
}

export interface IAffordanceInteractionPointers {
  wasString: string[];
  wasNumber: string[];
  wasBoolean: string[];
  wasNull: string[];
  wasArray: string[];
  wasObject: string[];
  wasMissing: string[];
  wasStringTrails: { [key: string]: IJsonTrail[] };
  wasNumberTrails: { [key: string]: IJsonTrail[] };
  wasBooleanTrails: { [key: string]: IJsonTrail[] };
  wasNullTrails: { [key: string]: IJsonTrail[] };
  wasArrayTrails: { [key: string]: IJsonTrail[] };
  wasObjectTrails: { [key: string]: IJsonTrail[] };
  wasMissingTrails: { [key: string]: IJsonTrail[] };
}
