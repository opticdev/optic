export * from 'axax/esnext';
import _ from 'axax/esnext';
import { reduce } from 'axax/esnext/reduce';
export { reduce };
import { Subject } from 'axax/esnext';
import { Readable } from 'stream';

export function lastBy<T>(
  predicate: (subject: T) => string
): (source: AsyncIterable<T>) => AsyncIterable<T> {
  const findLastKey = reduce(
    (
      { lastByKey, keys }: { lastByKey: Map<string, T>; keys: string[] },
      subject: T
    ) => {
      const key = predicate(subject);
      let currentByKey = lastByKey.get(key);
      if (!currentByKey) keys.push(key);
      lastByKey.set(key, subject);

      return { lastByKey, keys };
    },
    { lastByKey: new Map(), keys: [] }
  );

  return async function* (source: AsyncIterable<T>) {
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
