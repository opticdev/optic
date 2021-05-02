export * from 'axax/esnext';
import _ from 'axax/esnext';
import { parser as jsonlParser } from 'stream-json/jsonl/Parser';
import StreamObject from 'stream-json/streamers/StreamObject';
import { reduce } from 'axax/esnext/reduce';
export { reduce };
import { Readable } from 'stream';

export function lastBy<T>(
  predicate: (subject: T) => string
): (source: AsyncIterable<T>) => AsyncIterable<T> {
  return async function* (source: AsyncIterable<T>) {
    const findLastKey = reduce(
      (
        { lastByKey, keys }: { lastByKey: Map<string, T>; keys: Set<string> },
        subject: T
      ) => {
        const key = predicate(subject);
        // rely on insertion order guarantee from Set to yield final results by
        // last key occurence
        keys.delete(key);
        keys.add(key);
        lastByKey.set(key, subject);

        return { lastByKey, keys };
      },
      { lastByKey: new Map(), keys: new Set<string>() }
    );

    const { lastByKey, keys } = await findLastKey(source);

    for (let key of keys) {
      const lastSubject = lastByKey.get(key);
      if (!lastSubject) throw new Error('unreachable');
      yield lastSubject;
    }
  };
}

export function fromReadable<T>(stream: Readable): () => AsyncIterable<T> {
  return async function* () {
    for await (const chunk of stream) {
      yield chunk;
    }
  };
}

export function fromReadableJSONL<T>(): (stream: Readable) => AsyncIterable<T> {
  return async function* (source: Readable) {
    let parseResults = source.pipe(jsonlParser());
    for await (let parseResult of parseResults) {
      yield parseResult.value;
    }
  };
}

export function fromJSONMap<T>(): (
  stream: Readable
) => AsyncIterable<{
  key: string;
  value: T;
}> {
  return async function* (source) {
    let parseResults = source.pipe(StreamObject.withParser());

    for await (let parseResult of parseResults) {
      yield parseResult;
    }
  };
}

export function tap<T>(
  predicate: (subject: T) => void
): (source: AsyncIterable<T>) => AsyncIterable<T> {
  return async function* (source: AsyncIterable<T>) {
    for await (let chunk of source) {
      predicate(chunk);
      yield chunk;
    }
  };
}
