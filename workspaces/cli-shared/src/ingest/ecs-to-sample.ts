import * as uuid from 'uuid';
import { IHttpInteraction } from '@useoptic/optic-domain';
//@todo MIKE 'ecs' needs types
//@todo write tests
export function ecsToHttpInteraction(
  ecs: any,
  id: string = uuid.v4()
): IHttpInteraction {
  const { request, response } = ecs.http;
  const { path, domain } = ecs.url;
  const lowerCasedRequestHeaders = convertObjKeysToLower(request.headers);
  const lowerCasedResponseHeaders = convertObjKeysToLower(response.headers);
  function extractBody(message: any) {
    const content =
      message.body && message.body.content ? message.body.content : '';
    if (typeof content === 'string') {
      return {
        asJsonString: tryParseJson(content),
        asText: content,
        shapeHashV1Base64: null,
      };
    } else {
      return {
        asJsonString: null,
        asText: null,
        shapeHashV1Base64: null,
      };
    }
  }

  return {
    uuid: id,
    request: {
      host: domain,
      method: request.method,
      path,
      query: {
        asJsonString: null,
        asText: null,
        shapeHashV1Base64: null,
      },
      headers: {
        asJsonString: null,
        asText: null,
        shapeHashV1Base64: null,
      },
      body: {
        contentType:
          request.headers && lowerCasedRequestHeaders['content-type']
            ? lowerCasedRequestHeaders['content-type']
            : null,
        value: extractBody(request),
      },
    },
    response: {
      statusCode: response.status_code,
      headers: {
        asJsonString: null,
        asText: null,
        shapeHashV1Base64: null,
      },
      body: {
        contentType:
          response.headers && lowerCasedResponseHeaders['content-type']
            ? lowerCasedResponseHeaders['content-type']
            : null,
        value: extractBody(response),
      },
    },
    tags: [],
  };
}

function tryParseJson(json: string) {
  try {
    JSON.parse(json);
    return json;
  } catch (e) {
    return null;
  }
}
function convertObjKeysToLower(obj: Object) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v])
  );
}
