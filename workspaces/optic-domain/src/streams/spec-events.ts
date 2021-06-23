import { Readable } from 'stream';
import { takeWhile } from 'axax/esnext/takeWhile';

import { fromJSONArray } from '../async-tools';

type Event = any; // TODO change to event typing

export function fromJSONStream(): (source: Readable) => AsyncIterable<Event> {
  return fromJSONArray<Event>();
}

export function takeBatchesUntil(
  batchCommitId: string
): (iterable: AsyncIterable<Event>) => AsyncIterable<Event> {
  let seenBatchCommitId = false;
  return takeWhile((event) => {
    if (seenBatchCommitId) {
      return false;
    }
    if (event.BatchCommitEnded?.batchId === batchCommitId) {
      seenBatchCommitId = true;
    }
    return true;
  });
}
