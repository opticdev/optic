import { IHttpInteraction } from '@useoptic/domain-types';

export interface ICaptureService {
  startDiff(
    events: any[],
    ignoreRequests: string[],
    additionalCommands: IRfcCommand[]
  ): Promise<IStartDiffResponse>;
  loadInteraction(
    interactionPointer: string
  ): Promise<ILoadInteractionResponse>;
}

export interface IDiffService {
  diffId(): string;
  // backend
  listDiffs(): Promise<IListDiffsResponse>;
  listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse>;
  loadStats(): Promise<ILoadStatsResponse>;
  // frontend for now
  loadDescription(diff: any): Promise<IGetDescriptionResponse>;
  listSuggestions(
    diff: any,
    interaction: any
  ): Promise<IListSuggestionsResponse>;
  loadInitialPreview(
    diff: any,
    currentInteraction: any,
    inferPolymorphism: boolean
  );
}

export interface IRfcCommand {}

export interface ILoadStatsResponse {
  diffedInteractionsCounter: string;
  skippedInteractionsCounter: string;
}

export interface IStartDiffResponse {
  diffId: string;
  notificationsUrl?: string;
}
export interface ILoadInteractionResponse {
  interaction: IHttpInteraction;
}
export interface IListDiffsResponse {
  diffs: any[];
}

export interface IListUnrecognizedUrlsResponse {
  urls: any[];
}

export interface IGetDescriptionResponse {}
export interface IListSuggestionsResponse {}
