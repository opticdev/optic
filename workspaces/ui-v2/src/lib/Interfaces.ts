import { IOpticEngine } from '@useoptic/spectacle';
import {
  CQRSCommand,
  IHttpInteraction,
  ICoreShapeKinds,
} from '@useoptic/optic-domain';
import { ICopy } from '<src>/pages/diffs/components/ICopyRender';
import { IJsonTrail } from '../../../cli-shared/build/diffs/json-trail';
import { DomainIdGenerator } from './domain-id-generator';
import { DiffLocation } from './parse-diff';
import { IEndpoint } from '<src>/types';

export interface IInterpretation {
  previewTabs: IInteractionPreviewTab[];
  diffDescription: IDiffDescription;
  updateSpecChoices: IPatchChoices;
  toCommands: (choices: IPatchChoices) => CQRSCommand[];
}

export interface IShapeUpdateChoice {
  coreShapeKind: ICoreShapeKinds;
  isValid: boolean;
}

export interface IPatchChoices {
  copy: ICopy[];
  shapes: IShapeUpdateChoice[];
  isOptional?: boolean;
  shouldRemoveField?: boolean;
  isField?: boolean;
  isQueryParam?: boolean;
  isShape?: boolean;
  includeNewBody?: boolean;
  isNewRegionDiff?: boolean;
}

export interface IInteractionPreviewTab {
  title: string;
  invalid: boolean;
  assertion: ICopy[];
  jsonTrailsByInteractions: { [key: string]: IJsonTrail[] };
  interactionPointers: string[];
}

export interface BodyPreview {
  asJson: any | null;
  asText: any | null;
  noBody: boolean;
  empty: boolean;
}
export interface IDiffDescription {
  title: ICopy[];
  assertion: ICopy[];
  location: DiffLocation;
  changeType: IChangeType;
  getJsonBodyToPreview: (interaction: IHttpInteraction) => BodyPreview;
  unknownDiffBehavior?: boolean;
  diffHash: string;
}

export interface ISuggestion {
  action: ICopyPair;
  commands: CQRSCommand[];
  changeType: IChangeType;
}

export enum IChangeType {
  Added,
  Changed,
  Removed,
}

interface ICopyPair {
  activeTense: ICopy[];
  pastTense: ICopy[];
}

export interface ISuggestion {
  action: ICopyPair;
  commands: CQRSCommand[];
  changeType: IChangeType;
}

// Diff Types the UI Handles

// TODO QPB either remove this or handle this in a parsing function - this just means we have to update multiple places
export const allowedDiffTypes: {
  [key: string]: {
    isBodyShapeDiff: boolean;
    inQuery: boolean;
    inRequest: boolean;
    inResponse: boolean;
    unmatchedUrl: boolean;
    asString: string;
  };
} = {
  UnmatchedRequestUrl: {
    isBodyShapeDiff: false,
    inQuery: false,
    inRequest: false,
    inResponse: false,
    unmatchedUrl: true,
    asString: 'UnmatchedRequestUrl',
  },
  UnmatchedRequestMethod: {
    isBodyShapeDiff: false,
    inQuery: false,
    inRequest: false,
    inResponse: false,
    unmatchedUrl: true,
    asString: 'UnmatchedRequestMethod',
  },
  UnmatchedQueryParameters: {
    isBodyShapeDiff: false,
    inQuery: true,
    inRequest: false,
    inResponse: false,
    unmatchedUrl: false,
    asString: 'UnmatchedQueryParameters',
  },
  UnmatchedRequestBodyContentType: {
    isBodyShapeDiff: false,
    inQuery: false,
    inRequest: true,
    inResponse: false,
    unmatchedUrl: false,
    asString: 'UnmatchedRequestBodyContentType',
  },
  UnmatchedResponseBodyContentType: {
    isBodyShapeDiff: false,
    inQuery: false,
    inRequest: false,
    inResponse: true,
    unmatchedUrl: false,
    asString: 'UnmatchedResponseBodyContentType',
  },
  UnmatchedResponseStatusCode: {
    isBodyShapeDiff: false,
    inQuery: false,
    inRequest: false,
    inResponse: true,
    unmatchedUrl: false,
    asString: 'UnmatchedResponseStatusCode',
  },
  UnmatchedQueryParametersShape: {
    isBodyShapeDiff: true,
    inQuery: true,
    inRequest: false,
    inResponse: false,
    unmatchedUrl: false,
    asString: 'UnmatchedQueryParametersShape',
  },
  UnmatchedRequestBodyShape: {
    isBodyShapeDiff: true,
    inQuery: false,
    inRequest: true,
    inResponse: false,
    unmatchedUrl: false,
    asString: 'UnmatchedRequestBodyShape',
  },
  UnmatchedResponseBodyShape: {
    isBodyShapeDiff: true,
    inQuery: false,
    inRequest: false,
    inResponse: true,
    unmatchedUrl: false,
    asString: 'UnmatchedResponseBodyShape',
  },
};

export const allowedDiffTypesKeys: string[] = Object.keys(allowedDiffTypes);

// Properties of Each Diff Types

export const isBodyShapeDiff = (key: string): boolean =>
  allowedDiffTypes[key]?.isBodyShapeDiff;
export const isDiffForKnownEndpoint = (key: string): boolean =>
  !allowedDiffTypes[key]?.unmatchedUrl;

///////////////////////////////////////
export type CurrentSpecContext = {
  currentSpecPaths: any[];
  currentSpecEndpoints: IEndpoint[];
  domainIds: DomainIdGenerator;
  idGeneratorStrategy: 'sequential' | 'random';
  opticEngine: IOpticEngine;
};
