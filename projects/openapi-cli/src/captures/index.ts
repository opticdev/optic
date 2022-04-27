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
    body: CapturedBody;
    // TODO: add support for headers and query params
  };
  response: {
    statusCode: number;
    body: CapturedBody;
    // TODO: add support headers
  };
}
