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
  loadStats(): Promise<ILoadStatsResponse>;
}

export interface IRfcCommand {}

export interface ILoadStatsResponse {
  totalInteractions: number;
  processed: number;
  captureCompleted: boolean;
}

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
  rfcState: any;
}

export interface IListUnrecognizedUrlsResponse {
  urls: any[];
}
