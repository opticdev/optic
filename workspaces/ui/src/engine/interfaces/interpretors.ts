import { IParsedLocation } from './interfaces';
import { IJsonTrail } from '@useoptic/cli-shared/build/diffs/json-trail';

export interface IInterpretation {
  suggestions: ISuggestion[];
  previewTabs: IInteractionPreviewTab[];
  overrideTitle?: ICopy[];
}

export interface IDiffSuggestionPreview {
  for: 'shape' | 'region';
  diffDescription: IDiffDescription;
  tabs: IInteractionPreviewTab[];
  suggestions: ISuggestion[];
  overrideTitle?: ICopy[];
}

export interface IInteractionPreviewTab {
  title: string;
  allowsExpand: boolean;
  invalid: boolean;
  assertion: ICopy[];
  jsonTrailsByInteractions: { [key: string]: IJsonTrail[] };
  interactionPointers: string[];
}

interface BodyPreview {
  asJson: any | null;
  asText: any | null;
}
export interface IDiffDescription {
  title: ICopy[];
  assertion: ICopy[];
  location: IParsedLocation;
  changeType: IChangeType;
  getJsonBodyToPreview: (interaction: any) => BodyPreview;
}

export interface ISuggestion {
  action: ICopyPair;
  commands: any[];
  changeType: IChangeType;
}

export interface ICopy {
  style: ICopyStyle;
  text: string;
}

interface ICopyPair {
  activeTense: ICopy[];
  pastTense: ICopy[];
}

export enum IChangeType {
  Added,
  Changed,
  Removed,
}

export enum ICopyStyle {
  Plain,
  Code,
}

export function plain(text: string): ICopy {
  return { text: text.trim(), style: ICopyStyle.Plain };
}
export function code(text: string): ICopy {
  return { text: text.trim(), style: ICopyStyle.Code };
}
