import events from 'events';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
/*

  Interface for traffic, expose what the differ cares about via interfaces
   - different formats can have different implementations
   - debug one (just to get rolling)
     - HTTP Interaction
     - HAR
     - Postman?

   */
export interface ApiTraffic {
  method: OpenAPIV3.HttpMethods;
  path: string;
  queryString: string;
  response: {
    statusCode: string;
    body: {
      contentType?: string;
      jsonBodyString?: string;
    };
  };
  requestBody?: {
    contentType?: string;
    jsonBodyString?: string;
  };
}

/*

  Interface for traffic, should get traffic (somehow), and emit each interaction into our queue
   - each implementation should be self contained starting / parsing / stopping traffic collection
   - known types
     - file
     - in-memory (for debugging)
     - proxy
     - postman
     - sniff
     - chrome

   */

export interface ITrafficSource {
  start(): Promise<void>;
  stop(): Promise<void>;
  emitTraffic(traffic: ApiTraffic): Promise<void>;
  on(event: 'traffic', listener: (example: ApiTraffic) => void): this;
}

export class TrafficSource
  extends events.EventEmitter
  implements ITrafficSource
{
  emitTraffic(traffic: ApiTraffic): Promise<void> {
    this.emit('traffic', traffic);
    return Promise.resolve();
  }

  start(): Promise<void> {
    return Promise.resolve(undefined);
  }

  stop(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
