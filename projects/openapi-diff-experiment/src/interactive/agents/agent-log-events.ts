import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export type AgentLogEvent =
  | ReadingSpec
  | PatchingSpec
  | UnexpectedError
  | DiffingTraffic;

export enum AgentLogEvents {
  reading,
  patching,
  error,
  diffingTraffic,
}

type ReadingSpec = { event: AgentLogEvents.reading; location: string };
type PatchingSpec = { event: AgentLogEvents.patching; patches: string[] };
type UnexpectedError = {
  event: AgentLogEvents.error;
  error: string;
  classification: string;
};
type DiffingTraffic = {
  // matched?: { pathPattern: string; method: OpenAPIV3.HttpMethods };
  path: string;
  hasDiffs: boolean;
  statusCode: string;
  method: string;
  event: AgentLogEvents.diffingTraffic;
};
