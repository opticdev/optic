// TODO QPB clean up usages of IContribution and IContributions
export interface IContribution {
  id: string;
  contributionKey: string;
  value: string;
  endpointId: string;
}
