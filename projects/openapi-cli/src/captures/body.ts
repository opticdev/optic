import { Readable } from 'stream';
import { types } from 'util';

export interface CapturedBody {
  contentType: string | null;
  size: number; // size in bytes, defaults to -1
  stream: Readable | null;
}

export class CapturedBody {
  static from(
    source: Readable | Buffer | ArrayBuffer | string | null = null,
    contentType: string | null = null,
    size = 0
  ) {
    let stream: Readable | null = null;
    let buffer: Buffer | null = null;

    if (source === null) {
      stream = null;
    } else if (source instanceof Readable) {
      stream = source;
    } else if (Buffer.isBuffer(source)) {
      buffer = source;
    } else if (types.isAnyArrayBuffer(source)) {
      buffer = Buffer.from(source);
    } else if (ArrayBuffer.isView(source)) {
      buffer = Buffer.from(source.buffer, source.byteOffset, source.byteLength);
    } else {
      buffer = Buffer.from(source);
    }

    if (buffer) {
      stream = Readable.from(buffer);
    }

    return { contentType, stream, size };
  }

  static fromJSON(json: { [key: string]: any }, ...rest) {
    return CapturedBody.from(JSON.stringify(json), ...rest);
  }

  static body(body: CapturedBody) {
    return body.stream;
  }

  static async arrayBuffer(body: CapturedBody) {
    const { buffer, byteOffset, byteLength } = await consumeBody(body);
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }

  static async json(body) {
    const text = await CapturedBody.text(body);
    return JSON.parse(text);
  }

  // TODO: add support for stream parsing JSON (see stream-json package)
  // static async jsonStream() {}

  static async text(body: CapturedBody) {
    const buffer = await consumeBody(body);
    return new TextDecoder().decode(buffer);
  }
}

async function consumeBody(body: CapturedBody): Promise<Buffer> {
  const { stream } = body;
  if (stream === null) {
    return Buffer.alloc(0);
  }
  if (Readable.isDisturbed && Readable.isDisturbed(stream)) {
    throw new TypeError(
      'Cannot consume CapturedBody: stream can only be consumed once'
    );
  }

  let chunks: any[] = [];
  let readBytes = 0;
  for await (const chunk of stream) {
    if (body.size > 0 && readBytes + chunk.length > body.size) {
      const error = new Error(
        'Cannot consume CapturedBody: stream of body larger than specified size'
      );
      stream.destroy(error);
      throw error;
    }

    readBytes += chunk.length;
    chunks.push(chunk);
  }

  if (
    stream.readableEnded !== true &&
    // @ts-ignore
    stream._readableState.ended !== true
  ) {
    throw new Error(
      'Cannot consnume CapturedBody: stream of body closed prematurely'
    );
  }
  if (chunks.every((chunk) => typeof chunk === 'string')) {
    return Buffer.from(chunks.join(''));
  } else {
    return Buffer.concat(chunks, readBytes);
  }
}
