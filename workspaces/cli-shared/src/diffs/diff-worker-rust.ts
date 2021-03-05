import { parseIgnore } from '@useoptic/cli-config';
import { IHttpInteraction } from '@useoptic/domain-types';
import { spawn as spawnDiffEngine } from '@useoptic/diff-engine';
import {
  CaptureInteractionIterator,
  LocalCaptureInteractionPointerConverter,
} from '../captures/avro/file-system/interaction-iterator';
import fs from 'fs-extra';
import path from 'path';
import Chain, { chain } from 'stream-chain';
import { fork } from 'stream-fork';
import { Readable, Writable } from 'stream';
import { stringer as JSONLStringer } from 'stream-json/jsonl/Stringer';
import { EventEmitter } from 'events';

export interface IDiffProjectionEmitterConfig {
  diffId: string;
  specFilePath: string;
  ignoreRequestsFilePath: string;
  filtersFilePath: string;
  additionalCommandsFilePath: string;
  captureBaseDirectory: string;
  captureId: string;
}

export function getDiffOutputPaths(values: {
  captureBaseDirectory: string;
  captureId: string;
  diffId: string;
}) {
  const { captureBaseDirectory, captureId, diffId } = values;
  const base = path.join(captureBaseDirectory, captureId, 'diffs', diffId);
  const diffs = path.join(base, 'diffs.json');
  const diffsStream = path.join(base, 'diffs.jsonl');
  const stats = path.join(base, 'stats.json');
  const undocumentedUrls = path.join(base, 'undocumentedUrls.json');
  const events = path.join(base, 'events.json');
  const ignoreRequests = path.join(base, 'ignoreRequests.json');
  const filters = path.join(base, 'filters.json');
  const additionalCommands = path.join(base, 'additionalCommands.json');

  return {
    base,
    diffs,
    diffsStream,
    stats,
    undocumentedUrls,
    events,
    ignoreRequests,
    filters,
    additionalCommands,
  };
}

export class DiffWorkerRust {
  events: EventEmitter;
  private hasMoreInteractions: boolean = true;
  private diffedInteractionsCounter: BigInt = BigInt(0);
  private skippedInteractionsCounter: BigInt = BigInt(0);
  private finished: boolean = false;
  private ended: boolean = false;

  constructor(private config: IDiffProjectionEmitterConfig) {
    this.events = new EventEmitter();
  }

  async start() {
    console.log('running');

    console.time('load inputs');
    const [ignoreRequests, filters] = await Promise.all([
      fs.readJson(this.config.ignoreRequestsFilePath),
      fs.readJson(this.config.filtersFilePath),
    ]);
    console.timeEnd('load inputs');
    const ignoredRequests = parseIgnore(ignoreRequests);

    function filterIgnoredRequests(interaction: IHttpInteraction) {
      return !ignoredRequests.shouldIgnore(
        interaction.request.method,
        interaction.request.path
      );
    }
    // TODO: re-enable or reconsider filtering by endpoints, disabled now as we're
    // trying to not read the spec with Scala
    const interactionFilter = filterIgnoredRequests;
    const interactionIterator = CaptureInteractionIterator(
      {
        captureId: this.config.captureId,
        captureBaseDirectory: this.config.captureBaseDirectory,
      },
      interactionFilter
    );

    const diffOutputPaths = getDiffOutputPaths(this.config);

    const interactionPointerConverter = new LocalCaptureInteractionPointerConverter(
      {
        captureBaseDirectory: this.config.captureBaseDirectory,
        captureId: this.config.captureId,
      }
    );

    await fs.ensureDir(diffOutputPaths.base);

    // setup streams
    const interactionsStream = chain([
      Readable.from(interactionIterator, {
        objectMode: true,
      }),
      (item) => {
        this.skippedInteractionsCounter = item.skippedInteractionsCounter;
        this.diffedInteractionsCounter = item.diffedInteractionsCounter;
        this.hasMoreInteractions = item.hasMoreInteractions;
        if (!item.hasMoreInteractions || this.ended) {
          return Chain.final();
        }

        if (!item.interaction) return;

        const { batchId, index } = item.interaction.context;
        let interactionPointer = interactionPointerConverter.toPointer(
          item.interaction.value,
          {
            interactionIndex: index,
            batchId,
          }
        );

        return [[item.interaction.value, [interactionPointer]]];
      },
      JSONLStringer(),
    ]);
    const diffsSink = fs.createWriteStream(diffOutputPaths.diffsStream);
    let writingDiffs: Promise<void> = new Promise((resolve, reject) => {
      function onFinish() {
        cleanup();
        resolve();
      }
      function onError(err: Error) {
        cleanup();
        reject(err);
      }

      function cleanup() {
        diffsSink.removeListener('finish', onFinish);
        diffsSink.removeListener('error', onError);
      }

      diffsSink.once('finish', onFinish);
      diffsSink.once('error', onError);
    });

    const diffEngine = spawnDiffEngine({ specPath: diffOutputPaths.events });
    Promise.all([diffEngine.result, writingDiffs]).then(
      () => {
        this.finish();
      },
      (err) => {
        this.destroy(err);
      }
    );

    const diffEngineLog = fs.createWriteStream(
      path.join(diffOutputPaths.base, 'diff-engine-output.log')
    );

    let processStreams: Writable[] = [diffEngine.input];
    if (process.env.OPTIC_DEVELOPMENT === 'yes') {
      processStreams.push(
        fs.createWriteStream(
          path.join(diffOutputPaths.base, 'interactions.jsonl')
        )
      );
    }

    // connect it all together to form a pipeline
    interactionsStream.pipe(fork(processStreams));
    diffEngine.output.pipe(diffsSink);
    diffEngine.error.pipe(diffEngineLog);
  }

  private destroy(err?: Error) {
    if (this.ended) return;
    this.ended = true;
    if (err) {
      this.events.emit('error', err);
    }
    this.events.emit('end');
  }

  private finish() {
    if (this.ended || this.finished) return;
    this.finished = true;
    this.ended = true;
    this.hasMoreInteractions = false;
    this.events.emit('finish');
  }

  async *progress(): AsyncIterable<{
    hasMoreInteractions: boolean;
    diffedInteractionsCounter: string;
    skippedInteractionsCounter: string;
  }> {
    const report = () => ({
      diffedInteractionsCounter: this.diffedInteractionsCounter.toString(),
      skippedInteractionsCounter: this.skippedInteractionsCounter.toString(),
      // this seems weird, but is right: downstream doesn't care whether we're doing reading interactions
      // it cares whether we're done diffing
      hasMoreInteractions: !this.finished,
    });

    yield report();

    // Progress reporting
    while (!this.ended) {
      yield await new Promise((resolve) => {
        const events = this.events;
        events.once('end', onEnd);
        let timeout = setTimeout(onTimeout, 1000);

        function onEnd() {
          cleanup();
          resolve(report());
        }

        function onTimeout() {
          cleanup();
          resolve(report());
        }

        function cleanup() {
          events.removeListener('end', onEnd);
          clearTimeout(timeout);
        }
      });
    }
  }
}
