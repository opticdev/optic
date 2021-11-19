import { ApiTraffic } from '../types';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export class SimpleExampleTraffic implements ApiTraffic {
  constructor(
    private _request: { method: string; path: string },
    private _response: { statusCode: string; json?: any }
  ) {}
  get method() {
    return this._request.method.toLowerCase() as OpenAPIV3.HttpMethods;
  }
  get path() {
    return this._request.path;
  }
  get response() {
    return {
      statusCode: this._response.statusCode,
      body: {
        contentType: this._response.json ? 'application/json' : undefined,
        jsonBodyString: this._response.json
          ? JSON.stringify(this._response.json)
          : undefined,
      },
    };
  }
}

export function makeExample(
  path: string,
  method: string | OpenAPIV3.HttpMethods,
  statusCode: string = '200',
  jsonBody?: object | undefined
) {
  return new SimpleExampleTraffic(
    { path, method },
    { statusCode, json: jsonBody }
  );
}
