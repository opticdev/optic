import { IFact, OpenApiFact } from '@useoptic/openapi-utilities';

import * as Facts from '../../specs/streams/facts';
import { DocumentedBody } from '../body';

export async function* fromBodyExampleFacts(
  facts: AsyncIterable<IFact<OpenApiFact>>
): AsyncIterable<DocumentedBody> {
  let forkableFacts = forkable(facts);
  let exampleFacts = Facts.bodyExamples(forkableFacts.fork());

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
function forkable<T>(iterable: AsyncIterable<T>): {
  fork: () => AsyncIterable<T>;
} {
  const source = iterable[Symbol.asyncIterator]();
  let branches: AsyncIterable<T>[] = [];

  // which branches have closed
  let started = false;
  let pendingResults: Promise<IteratorResult<T>>[];
  let pendingConsumers: Promise<void>[] = [];
  let branchResolvers: (() => void)[] = [];

  async function next(): Promise<void> {
    started = true;
    await Promise.all(pendingConsumers);
    pendingConsumers = [];
    pendingResults = [];

    let pendingResult = source.next();

    for (let i in branches) {
      pendingResults.push({ ...pendingResult }); // queue new result for each consumer
      pendingConsumers.push(
        // allow each consumer to indicate they have consumed their result
        new Promise((resolve) => branchResolvers.push(resolve))
      );
    }

    await pendingResult;
  }

  async function* branch(i: number): AsyncIterable<T> {
    if (started)
      throw new Error(
        'Cannot fork async iterable after consumption has already started'
      );
    while (true) {
      let pendingResult = pendingResults[i];
      if (!pendingResult) {
        await next();
      } else {
        let result = await pendingResult;

        if (result.value) yield result.value;

        let resolve = branchResolvers[i];
        if (resolve) resolve();

        if (result.done) return;
      }
    }
  }

  return {
    fork(): AsyncIterable<T> {
      let newBranchIndex = branches.length;
      let newBranch = branch(newBranchIndex);
      branches.push(newBranch);
      return newBranch;
    },
  };
}
