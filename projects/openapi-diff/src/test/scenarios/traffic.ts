import { ApiTraffic } from '../../services/traffic/types';
import { OpenAPIV3 } from 'openapi-types';

class DebugTrafficImpl implements ApiTraffic {
  constructor(public method: OpenAPIV3.HttpMethods, public path: string) {}

  queryString: string = '';

  response: ApiTraffic['response'] = {
    statusCode: '200',
    body: {},
  };

  requestBody: ApiTraffic['requestBody'];

  withQuery(queryString: string) {
    this.queryString = queryString;
    return this;
  }

  withStatusCode(statusCode: string) {
    this.response.statusCode = statusCode;
    return this;
  }

  withJsonResponse(json: any) {
    this.response.body.contentType = 'application/json';
    this.response.body.jsonBodyString = JSON.stringify(json);
    return this;
  }

  withJsonRequest(json: any) {
    this.requestBody = {
      contentType: 'application/json',
      jsonBodyString: JSON.stringify(json),
    };
    return this;
  }
}

export function DebugTraffic(method: string, path: string) {
  return new DebugTrafficImpl(method as OpenAPIV3.HttpMethods, path);
}

DebugTraffic('get', '/example');
