import { Readable } from 'stream';
import { fromReadableJSONL } from '../../async-tools';

export interface LearnedBodies {
  pathId: string;
  method: string;
  queryParameters: LearnedQueryParameters | null;
  requests: LearnedBody[];
  responses: LearnedBody[];
}

export interface LearnedBody {
  contentType: string;
  statusCode?: number;
  commands: any[];
  rootShapeId: string;
}

export interface LearnedQueryParameters {
  commands: any[];
  rootShapeId: string;
}

export function fromJSONL(): (
  source: Readable
) => AsyncIterable<LearnedBodies> {
  return fromReadableJSONL();
}
