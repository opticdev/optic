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
          request.headers && request.headers['content-type']
            ? request.headers['content-type']
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
          response.headers && response.headers['content-type']
            ? response.headers['content-type']
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
