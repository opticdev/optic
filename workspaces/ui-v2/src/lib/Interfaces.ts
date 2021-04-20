import { ICopy } from '../optic-components/diffs/render/ICopyRender';
import { IEndpoint } from '../optic-components/hooks/useEndpointsHook';
import {
  IRequestBody,
  IResponseBody,
} from '../optic-components/hooks/useEndpointBodyHook';
import { IJsonTrail } from '../../../cli-shared/build/diffs/json-trail';
import { IgnoreRule } from './ignore-rule';
import { DomainIdGenerator } from './domain-id-generator';

export interface IInterpretation {
  previewTabs: IInteractionPreviewTab[];
  diffDescription?: IDiffDescription;
  updateSpecChoices: IPatchChoices;
  toCommands: (choices: IPatchChoices) => any[];
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
  isShape?: boolean;
}

export interface IInteractionPreviewTab {
  title: string;
  allowsExpand: boolean;
  invalid: boolean;
  assertion: ICopy[];
  jsonTrailsByInteractions: { [key: string]: IJsonTrail[] };
  interactionPointers: string[];
  ignoreRule: IgnoreRule;
}

export interface BodyPreview {
  asJson: any | null;
  asText: any | null;
  noBody: boolean;
}
export interface IDiffDescription {
  title: ICopy[];
  assertion: ICopy[];
  location: IParsedLocation;
  changeType: IChangeType;
  getJsonBodyToPreview: (interaction: any) => BodyPreview;
  unknownDiffBehavior?: boolean;
  diffHash: string;
}

export interface ISuggestion {
  action: ICopyPair;
  commands: any[];
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
  commands: any[];
  changeType: IChangeType;
}

export enum ICoreShapeKinds {
  ObjectKind = '$object',
  ListKind = '$list',
  MapKind = '$map',
  OneOfKind = '$oneOf',
  AnyKind = '$any',
  StringKind = '$string',
  NumberKind = '$number',
  BooleanKind = '$boolean',
  NullableKind = '$nullable',
  OptionalKind = '$optional',
  UnknownKind = '$unknown',
}
export enum ICoreShapeInnerParameterNames {
  ListInner = '$listItem',
  NullableInner = '$nullableInner',
  OptionalInner = '$optionalInner',
}

// Diff Types the UI Handles

export const allowedDiffTypes: {
  [key: string]: {
    isBodyShapeDiff: boolean;
    inRequest: boolean;
    inResponse: boolean;
    unmatchedUrl: boolean;
    asString: string;
  };
} = {
  UnmatchedRequestUrl: {
    isBodyShapeDiff: false,
    inRequest: false,
    inResponse: false,
    unmatchedUrl: true,
    asString: 'UnmatchedRequestUrl',
  },
  UnmatchedRequestMethod: {
    isBodyShapeDiff: false,
    inRequest: false,
    inResponse: false,
    unmatchedUrl: true,
    asString: 'UnmatchedRequestMethod',
  },
  UnmatchedRequestBodyContentType: {
    isBodyShapeDiff: false,
    inRequest: true,
    inResponse: false,
    unmatchedUrl: false,
    asString: 'UnmatchedRequestBodyContentType',
  },
  UnmatchedResponseBodyContentType: {
    isBodyShapeDiff: false,
    inRequest: false,
    inResponse: true,
    unmatchedUrl: false,
    asString: 'UnmatchedResponseBodyContentType',
  },
  UnmatchedResponseStatusCode: {
    isBodyShapeDiff: false,
    inRequest: false,
    inResponse: true,
    unmatchedUrl: false,
    asString: 'UnmatchedResponseStatusCode',
  },
  UnmatchedRequestBodyShape: {
    isBodyShapeDiff: true,
    inRequest: true,
    inResponse: false,
    unmatchedUrl: false,
    asString: 'UnmatchedRequestBodyShape',
  },
  UnmatchedResponseBodyShape: {
    isBodyShapeDiff: true,
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
export const DiffInRequest = (key: string): boolean =>
  allowedDiffTypes[key]?.inRequest;
export const DiffInResponse = (key: string): boolean =>
  allowedDiffTypes[key]?.inResponse;

// The ones we like to work with in the UI

export interface IRequestBodyLocation {
  contentType?: string;
  requestId?: string;
}

export interface IResponseBodyLocation {
  statusCode: number;
  contentType?: string;
  responseId?: string;
}

export interface IParsedLocation {
  pathId: string;
  method: string;
  inRequest?: IRequestBodyLocation;
  inResponse?: IResponseBodyLocation;
}

///////////////////////////////////////
export interface IToDocument {
  method: string;
  count: number;
  pathExpression: string;
}

export type CurrentSpecContext = {
  currentSpecEndpoints: IEndpoint[];
  currentSpecRequests: IRequestBody[];
  currentSpecResponses: IResponseBody[];
  domainIds: DomainIdGenerator;
};
