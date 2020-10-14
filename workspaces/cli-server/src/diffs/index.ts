import { EventEmitter } from 'events';
import { Readable } from 'stream';

export interface Diff {
  readonly id: string;
  readonly events: DiffEvents;

  start(): Promise<void>;
  progress(): ProgressStream;
  queries(): DiffQueries;
  stop(): Promise<void>;
}

export interface DiffConstructor {
  new (config: DiffConfigObject): Diff;
}

export function createDiff(ctor: DiffConstructor, config: DiffConfigObject) {
  return new ctor(config);
}

export interface DiffEvents extends EventEmitter {
  addListener(event: 'finish', listener: () => void): this;
  addListener(event: 'error', listener: (err: Error) => void): this;

  emit(event: 'finish'): boolean;
  emit(event: 'error', err: Error): boolean;

  on(event: 'finish', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;

  once(event: 'finish', listener: () => void): this;
  once(event: 'error', listener: (err: Error) => void): this;

  prependListener(event: 'finish', listener: () => void): this;
  prependListener(event: 'error', listener: (err: Error) => void): this;

  prependOnceListener(event: 'finish', listener: () => void): this;
  prependOnceListener(event: 'error', listener: (err: Error) => void): this;
}

export interface DiffQueries {
  diffs(): Readable;
  undocumentedUrls(): Readable;
  stats(): Promise<DiffStats>;
}

export interface DiffConfigObject {
  configPath: string;
  captureId: string;
  captureBaseDirectory: string;
  diffId: string;
  endpoints?: Array<{ pathId: string; method: string }>;
  specPath: string;
}

export interface ProgressStream extends Readable {}

export interface ProgressEvent {
  type: 'progress';
  data: {
    diffedInteractionsCounter: string;
    skippedInteractionsCounter: string;
    hasMoreInteractions: string;
  };
}

export interface DiffStats {
  [key: string]: number | string | boolean;
}

// @TODO: Figure out a reasonable way to type the streams, defining the objects that are yielded.
//        It will require the construction of the stream that's returned to have the required
//        Readable interface implemented. The tricky thing about that is that streams are constructed
//        in a lot of different possible ways. For really strong typing, every part of the pipeline
//        has to play ball. Perhaps a pragmatic first step is a PassThrough<T> that can be used to tack
//        on to an existing pipeline. But if we're casting types anyway, we could just do that during read?
//
//        Ideal would be:
// interface ResultStream<T> extends Readable<T> {}
//
//        Alternatively, we could use TypeScript's native support for AsyncIterable's and the flawless
//        interop with streams provided by Node. Issue with that is that tooling around AsyncIterables is
//        pretty meager.
// export async function* resultStreamGenerator<T>(
//   stream: Readable
// ): AsyncIterable<T> {
//   for await (let item of stream) {
//     yield item as T;
//   }
// }
