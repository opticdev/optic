import { ApiTraffic } from '../types';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { isThisExpression } from '@babel/types';

// TODO: Fill in the type
// {
//   "uuid": "c11116b1-cea5-401c-b151-da47ab43cee3",
//   "request": {
//     "host": "httpbin.org",
//     "method": "GET",
//     "path": "/get",
//     "headers": {
//       "shapeHashV1Base64": null,
//       "asJsonString": null,
//       "asText": null
//     },
//     "query": {
//       "shapeHashV1Base64": null,
//       "asJsonString": null,
//       "asText": "a=1"
//     },
//     "body": {
//       "contentType": null,
//       "value": {
//         "shapeHashV1Base64": null,
//         "asJsonString": null,
//         "asText": null
//       }
//     }
//   },
//   "response": {
//     "statusCode": 200,
//     "headers": {
//       "shapeHashV1Base64": null,
//       "asJsonString": null,
//       "asText": null
//     },
//     "body": {
//       "contentType": "application/json",
//       "value": {
//         "shapeHashV1Base64": "CAASEwoEYXJncxILCAASBwoBYRICCAISUAoHaGVhZGVycxJFCAASDAoGQWNjZXB0EgIIAhIKCgRIb3N0EgIIAhIQCgpVc2VyLUFnZW50EgIIAhIVCg9YLUFtem4tVHJhY2UtSWQSAggCEgwKBm9yaWdpbhICCAISCQoDdXJsEgIIAg==",
//         "asJsonString": "{\"args\":{\"a\":\"1\"},\"headers\":{\"Accept\":\"*/*\",\"Host\":\"httpbin.org\",\"User-Agent\":\"curl/7.64.1\",\"X-Amzn-Trace-Id\":\"Root=1-618d1bfc-0c9eea1060c29d6348b62f19\"},\"origin\":\"31.10.148.195\",\"url\":\"http://httpbin.org/get?a=1\"}",
//         "asText": null
//       }
//     }
//   },
//   "tags": []
// }
type IOpticCaptureHttpInteraction = any;

export class OpticHttpInteraction implements ApiTraffic {
  private _method: OpenAPIV3.HttpMethods;
  private _path: string;
  private _queryString: string;
  private _response: {
    statusCode: string;
    body: {
      contentType: string | undefined;
      jsonBodyString: string | undefined;
    };
  };

  constructor(_interaction: IOpticCaptureHttpInteraction) {
    this._method =
      _interaction.request.method.toLowerCase() as OpenAPIV3.HttpMethods;
    this._path = _interaction.request.path;
    this._queryString = _interaction.request.query.asText || '';
    this._response = {
      statusCode: _interaction.response.statusCode.toString(),
      body: {
        contentType: _interaction.response.body.contentType
          ? 'application/json'
          : undefined,
        jsonBodyString: _interaction.response.body.value.asJsonString
          ? _interaction.response.body.value.asJsonString
          : undefined,
      },
    };
  }

  get method() {
    return this._method;
  }
  get path() {
    return this._path;
  }
  get response() {
    return this._response;
  }

  get queryString() {
    return this._queryString;
  }
}
