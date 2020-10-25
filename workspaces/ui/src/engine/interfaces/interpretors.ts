import { IParsedLocation } from './interfaces';

export interface IInterpretation {
  suggestions: ISuggestion[];
  previewTabs: IInteractionPreviewTab[];
}

export interface IDiffSuggestionPreview {
  for: 'shape' | 'region';
  diffDescription: IDiffDescription;
  tabs: IInteractionPreviewTab[];
  suggestions: ISuggestion[];
}

export interface IInteractionPreviewTab {
  title: string;
  allowsExpand: boolean;
  interactionPointers: string[];
  //@todo figure out this interface
  renderBody: (interaction: string) => Promise<any>;
}

export interface IDiffDescription {
  title: ICopy[];
  assertion: ICopy[];
  location: IParsedLocation;
  changeType: IChangeType;
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
