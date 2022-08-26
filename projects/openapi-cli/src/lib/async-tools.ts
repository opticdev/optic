export * from 'axax/esnext';

import { Result } from 'ts-results';

// Fork an async iterable and share the backpressure (preventing memory bloat, but
// reading at rate of slowest consumer).
// Won't allow new forks once consumption has started through `forkable.start()`.
export function forkable<T>(iterable: AsyncIterable<T>): {
  fork: () => AsyncIterable<T>;
  start: () => void;
} {
  const source = iterable[Symbol.asyncIterator]();
  let branches: (() => AsyncIterable<T>)[] = [];

  let started = false;
  let reading = false;
  let pendingRead = Promise.resolve();
  let pendingStart: Deferred<void> = new Deferred();

  let pendingResults: (Promise<IteratorResult<T>> | null)[] = [];
  let pendingConsumers: Promise<void[]> = Promise.resolve([]);
  let deferredConsumers: Deferred<void>[] = [];

  async function next(): Promise<void> {
    started = true;
    if (reading) return;

    let resolveRead;
    reading = true;
    pendingRead = new Promise((resolve) => (resolveRead = resolve));

    await Promise.all(deferredConsumers.map(({ promise }) => promise));
    deferredConsumers = [];
    pendingResults = [];

    let pendingResult = source.next();

    pendingResults = branches.map(() => pendingResult);
    deferredConsumers = branches.map(() => new Deferred());

    pendingConsumers = Promise.all(
      deferredConsumers.map(({ promise }) => promise)
    );

    await pendingResult;
    reading = false;
    resolveRead();
  }

  function branch(i: number): () => AsyncIterable<T> {
    if (started)
      throw new Error(
        'Cannot fork async iterable after consumption has already started'
      );

    return async function* () {
      await pendingStart.promise;

      while (true) {
        let pendingResult = pendingResults[i];
        pendingResults[i] = null;

        if (!pendingResult) {
          if (!reading) {
            await next();
          } else {
            await pendingRead;
          }
        } else {
          let result = await pendingResult;

          if (result.value) yield result.value;

          let deferred = deferredConsumers[i];
          if (deferred) {
            setTimeout(() => {
              deferred.resolve();
            });
          }

          if (result.done) return;

          await pendingConsumers;
        }
      }
    };
  }

  return {
    fork(): AsyncIterable<T> {
      let newBranchIndex = branches.length;
      let newBranch = branch(newBranchIndex);
      branches.push(newBranch);
      return newBranch();
    },
    start() {
      started = true;
      pendingStart.resolve();
    },
  };
}

class Deferred<T> {
  promise: Promise<T>;
  resolve!: (result: T) => void;
  reject!: (err: Error) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

// execute a backpressure-less side effect
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

export async function* concat<T>(
  ...iters: AsyncIterable<T>[]
): AsyncIterable<T> {
  for (let iter of iters) {
    yield* iter;
  }
}

export async function collect<T>(source: AsyncIterable<T>): Promise<T[]> {
  let results: T[] = [];
  for await (let item of source) {
    results.push(item);
  }
  return results;
}

export async function* unwrap<T, E>(
  source: AsyncIterable<Result<T, E>>
): AsyncIterable<T> {
  for await (let result of source) {
    yield result.unwrap();
  }
}

export async function* unwrapOr<T, E>(
  source: AsyncIterable<Result<T, E>>,
  handler: (error: E) => void | Promise<void>
): AsyncIterable<T> {
  for await (let result of source) {
    if (result.ok) {
      yield result.val;
    } else {
      await handler(result.val);
    }
  }
}
