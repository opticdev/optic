//@ts-ignore
import * as deepCopy from 'deepcopy';
import { IHttpInteraction } from '@useoptic/proxy';
import { IArbitraryData, IBody } from '@useoptic/domain';

export function newInteraction(url: string, method: string) {
  return new InteractionHelper(url, method);
}

export function newBody(body: any) {
  return new BodyHelper(body);
}

export class InteractionHelper {
  public url: string;
  public method: string;
  public statusCode: number = 200;
  public requestBody: BodyHelper | null = null;
  public responseBody: BodyHelper | null = null;

  constructor(url: string, method: string) {
    this.url = url;
    this.method = method;
  }

  withUrl = (url: string) => {
    this.url = url;
  };
  withMethod = (method: string) => {
    this.method = method;
    return this;
  };
  withRequestBody = (body: BodyHelper | null | undefined) => {
    if (!body) {
      this.requestBody = null;
      return this;
    }
    this.requestBody = body;
    return this;
  };
  withStatusCode = (statusCode: number) => {
    this.statusCode = statusCode;
    return this;
  };
  withResponseBody = (body: BodyHelper | null | undefined) => {
    if (!body) {
      this.responseBody = null;
      return this;
    }
    this.responseBody = body;
    return this;
  };

  copy = () => {
    const interaction = new InteractionHelper(this.url, this.method);
    interaction.withRequestBody(this.requestBody?.copy() || null);
    interaction.withResponseBody(this.responseBody?.copy() || null);
    interaction.withStatusCode(this.statusCode);
    return interaction;
  };

  fork = (mutation: (a: InteractionHelper) => void) => {
    const a = this.copy();
    mutation(a);
    return a;
  };

  toInteraction(uuid = 'id'): IHttpInteraction {
    return {
      tags: [],
      uuid,
      response: {
        statusCode: this.statusCode,
        headers: {
          shapeHashV1Base64: null,
          asJsonString: null,
          asText: null,
        },
        body:
          this.responseBody === null
            ? {
                contentType: null,
                value: {
                  shapeHashV1Base64: null,
                  asJsonString: null,
                  asText: null,
                },
              }
            : {
                contentType: 'application/json',
                value: {
                  shapeHashV1Base64: null,
                  asJsonString: JSON.stringify(this.responseBody.value),
                  asText: null,
                },
              },
      },
      request: {
        host: 'example.com',
        method: this.method,
        path: this.url,
        query: {
          shapeHashV1Base64: null,
          asJsonString: null,
          asText: null,
        },
        headers: {
          shapeHashV1Base64: null,
          asJsonString: null,
          asText: null,
        },
        body:
          this.requestBody === null
            ? {
                contentType: null,
                value: {
                  shapeHashV1Base64: null,
                  asJsonString: null,
                  asText: null,
                },
              }
            : {
                contentType: 'application/json',
                value: {
                  shapeHashV1Base64: null,
                  asJsonString: JSON.stringify(this.requestBody.value),
                  asText: null,
                },
              },
      },
    };
  }
}

class BodyHelper {
  public value: any;

  constructor(value: any) {
    this.value = value;
  }

  copy = () => new BodyHelper(deepCopy(this.value));

  fork = (handler: (a: any) => any) => {
    const a = deepCopy(this.value);
    handler(a);
    return new BodyHelper(a);
  };
}
