import { CapturedBody } from './body';
import { CapturedBodies } from './streams/captured-bodies';
import { OpenAPIV3 } from '../specs';

export { CapturedBody, CapturedBodies };
export { CapturedInteractions } from './streams/captured-interactions';

export interface CapturedInteraction {
  request: {
    host: string;
    method: OpenAPIV3.HttpMethods;
    path: string;
    body: CapturedBody | null;
    // TODO: add support for headers and query params
  };
  response: {
    statusCode: number;
    body: CapturedBody | null;
    // TODO: add support headers
  };
}

export type CapturedRequest = CapturedInteraction['request'];
export type CapturedResponse = CapturedInteraction['response'];
