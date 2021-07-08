import { IJsonTrail } from './json-trail';
import { LearningResults } from '@useoptic/optic-domain';

export type ILearnedBodies = LearningResults.UndocumentedEndpointBodies.LearnedBodies;
export type ILearnedBody = LearningResults.UndocumentedEndpointBodies.LearnedBody;
export type ILearnedQueryParameters = LearningResults.UndocumentedEndpointBodies.LearnedQueryParameters;

export interface IAffordanceTrails {
  affordances: IAffordance[];
  interactions: IAffordanceInteractionPointers;
}

export interface IAffordanceTrailsDiffHashMap {
  [key: string]: IAffordanceTrails;
}

export interface IAffordance {
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
  wasEmptyArray: string[];
  wasStringTrails: { [key: string]: IJsonTrail[] };
  wasNumberTrails: { [key: string]: IJsonTrail[] };
  wasBooleanTrails: { [key: string]: IJsonTrail[] };
  wasNullTrails: { [key: string]: IJsonTrail[] };
  wasArrayTrails: { [key: string]: IJsonTrail[] };
  wasObjectTrails: { [key: string]: IJsonTrail[] };
  wasMissingTrails: { [key: string]: IJsonTrail[] };
  wasEmptyArrayTrails: { [key: string]: IJsonTrail[] };
}
