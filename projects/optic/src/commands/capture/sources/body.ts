import { Readable } from 'stream';

export interface CapturedBody {
  contentType: string | null;
  size: number; // size in bytes, defaults to -1
  body: string | null;
}

export class CapturedBody {
  static from(
    stringValue: string | null,
    contentType: string | null = null
  ): CapturedBody {
    return { contentType, body: stringValue, size: stringValue?.length || 0 };
  }

  static fromJSON(json: { [key: string]: any }, ...rest) {
    const asJsonString = JSON.stringify(json);
    return CapturedBody.from(asJsonString, 'application/json');
  }

  static body(body: CapturedBody) {
    return body.body;
  }

  static async json(body) {
    const text = await CapturedBody.text(body);
    return JSON.parse(text!);
  }

  static async text(body: CapturedBody) {
    return body.body;
  }
}
