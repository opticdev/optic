import { IHttpInteraction } from '@useoptic/domain-types';

export interface ICaptureService {
  startDiff(
    ignoreRequests: string[],
    additionalCommands: IRfcCommand[]
  ): Promise<IStartDiffResponse>;
}

export interface IDiffService {
  // backend
  loadInteraction(
    interactionPointer: string
  ): Promise<ILoadInteractionResponse>;
  listDiffs(): Promise<IListDiffsResponse>;
  listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse>;
}

export interface IRfcCommand {}
export interface IStartDiffResponse {
  notificationUrl: string;
  loadDiffUrl: string;
  loadUnrecognizedUrlsUrl: string;
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
