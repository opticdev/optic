import { IFact, OpenApiFact } from '@useoptic/openapi-utilities';

import * as Facts from '../../specs/streams/facts';
import { DocumentedBody } from '../body';

export async function* fromBodyExampleFacts(
  facts: AsyncIterable<IFact<OpenApiFact>>
): AsyncIterable<DocumentedBody> {
  let forkableFacts = forkable(facts);
  let exampleFacts = Facts.bodyExamples(forkableFacts.fork()());

  for await (let exampleFact of exampleFacts) {
    // const exampleBody =
    // TODO: parse string-encoded json for json content types
    // yield {
    //   contentType: exampleFact.value.contentType,
    //   value: exampleFact.value.value,
    // };
  }
}

// fork an async iterable and share the backpressure (preventing memory bloat, but reading at rate of slowest consumer)
export function forkable<T>(iterable: AsyncIterable<T>): {
  fork: () => () => AsyncIterable<T>;
} {
  const source = iterable[Symbol.asyncIterator]();
  let branches: (() => AsyncIterable<T>)[] = [];

  let started = false;
  let reading = false;
  let pendingRead = Promise.resolve();
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
    fork(): () => AsyncIterable<T> {
      let newBranchIndex = branches.length;
      let newBranch = branch(newBranchIndex);
      branches.push(newBranch);
      return newBranch;
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
