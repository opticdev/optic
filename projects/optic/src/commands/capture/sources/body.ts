import { Readable } from 'stream';

export interface CapturedBody {
  contentType: string | null;
  size: number; // size in bytes, defaults to -1
  body: string | null;
}

export class CapturedBody {
  static from(
    stringValue: string | null,
    contentType: string | null = null,
    size = 0
  ): CapturedBody {
    if (size > 0 && stringValue !== null) {
      return { contentType, body: stringValue, size };
    } else {
      return { contentType, body: null, size };
    }
  }

  static fromJSON(json: { [key: string]: any }, ...rest) {
    const asJsonString = JSON.stringify(json);
    return CapturedBody.from(
      asJsonString,
      'application/json',
      asJsonString.length
    );
  }

  static body(body: CapturedBody) {
    return body.body;
  }

  static async json(body) {
    const text = await CapturedBody.text(body);
    if (text) {
      return JSON.parse(text);
    }
  }

  // TODO: add support for stream parsing JSON (see stream-json package)
  // static async jsonStream() {}

  static async text(body: CapturedBody) {
    return body.body;
  }
}
