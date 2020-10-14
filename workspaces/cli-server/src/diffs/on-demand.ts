import { EventEmitter } from 'events';
import { runManagedScriptByName } from '@useoptic/cli-scripts';
import {
  getDiffOutputPaths,
  IDiffProjectionEmitterConfig,
} from '@useoptic/cli-shared/build/diffs/diff-worker';
import { ChildProcess } from 'child_process';
import fs from 'fs-extra';
import { readApiConfig } from '@useoptic/cli-config';

import {
  Diff,
  DiffConfigObject,
  DiffQueries as DiffQueriesInterface,
  DiffStats,
} from '.';

import lockfile from 'proper-lockfile';
import { Readable, PassThrough } from 'stream';
import { chain } from 'stream-chain';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { parser as jsonlParser } from 'stream-json/jsonl/Parser';
import { parser as jsonParser } from 'stream-json';

export class OnDemandDiff implements Diff {
  public readonly events: EventEmitter = new EventEmitter();
  private child!: ChildProcess;
  public readonly id: string;
  private readonly config: DiffConfigObject;
  private finished: boolean = false;

  constructor(config: DiffConfigObject) {
    this.id = config.diffId;
    this.config = config;
  }

  private lastProgress: {
    diffedInteractionsCounter: string;
    skippedInteractionsCounter: string;
    hasMoreInteractions: string;
  } | null = null;

  async start(): Promise<any> {
    const { config } = this;
    const apiConfig = await readApiConfig(config.configPath);

    const outputPaths = this.paths();
    await fs.ensureDir(outputPaths.base);
    await Promise.all([
      fs.copy(config.specPath, outputPaths.events),
      fs.writeJson(outputPaths.ignoreRequests, apiConfig.ignoreRequests || []),
      fs.writeJson(outputPaths.filters, config.endpoints || []),
      fs.writeJson(outputPaths.additionalCommands, []),
    ]);

    const scriptConfig: IDiffProjectionEmitterConfig = {
      captureId: config.captureId,
      diffId: config.diffId,
      captureBaseDirectory: config.captureBaseDirectory,
      specFilePath: outputPaths.events,
      ignoreRequestsFilePath: outputPaths.ignoreRequests,
      additionalCommandsFilePath: outputPaths.additionalCommands,
      filtersFilePath: outputPaths.filters,
    };
    console.log(JSON.stringify(scriptConfig));
    const child = runManagedScriptByName(
      process.env.OPTIC_RUST_DIFF_ENGINE === 'true'
        ? 'emit-diff-projections-rust'
        : 'emit-diff-projections',
      JSON.stringify(scriptConfig)
    );

    const onMessage = (x: any) => {
      if (x.type && x.type === 'progress') {
        this.lastProgress = { ...x.data };
      }
      this.events.emit(x.type, x.data);
    };
    const onError = (err: Error) => {
      cleanup();
      this.events.emit('error', err);
    };
    const onExit = (code: number, signal: string | null) => {
      cleanup();
      if (code !== 0) {
        // @TODO: wonder how we'll ever find out about this happening.
        console.error('Diff Worker exited with non-zero exit code');
      } else {
        this.finished = true;
        this.events.emit('finish');
      }
    };
    function cleanup() {
      child.removeListener('message', onMessage);
      child.removeListener('error', onError);
      child.removeListener('exit', onExit);
    }

    child.on('message', onMessage);
    child.once('error', onError);
    child.once('exit', onExit);

    this.child = child;

    return new Promise((resolve, reject) => {
      function onErr(err: Error) {
        cleanup();
        reject(err);
      }
      function onProgress(data: any) {
        cleanup();
        resolve();
      }
      function onFinish() {
        cleanup();
        resolve();
      }
      const cleanup = () => {
        this.events.removeListener('progress', onProgress);
        this.events.removeListener('error', onErr);
        this.events.removeListener('finish', onFinish);
      };

      this.events.once('progress', onProgress);
      this.events.once('error', onErr);
    });
  }

  private latestProgress() {
    const lastProgress = this.lastProgress;
    return lastProgress ? { ...lastProgress } : null;
  }

  private paths(): DiffPaths {
    return getDiffOutputPaths(this.config);
  }

  progress(): Readable {
    // NOTE: event emitters don't respect back pressure, so to make sure we don't overwhelm
    // downstream consumers, we stop observing progress events until a fully-buffered stream
    // drains again.
    const stream = new PassThrough({ objectMode: true, highWaterMark: 4 });
    stream.write({ type: 'progress', data: this.latestProgress() });

    if (this.finished) {
      stream.end();
    } else {
      let resume = () => {
        let write = (progress: { type: string; data: any }) => {
          if (!stream.write(progress)) {
            stopListening();
            stream.once('drain', resume);
          }
        };

        let end = () => {
          stopListening();
          stream.end();
        };

        function onProgress(data: any) {
          write({ type: 'progress', data });
        }
        function onErr(data: any) {
          write({ type: 'error', data });
          end();
        }
        function onFinish() {
          end();
        }

        const stopListening = () => {
          this.events.removeListener('progress', onProgress);
          this.events.removeListener('error', onErr);
          this.events.removeListener('finish', onFinish);
        };

        this.events.on('progress', onProgress);
        this.events.once('error', onErr);
        this.events.once('finish', onFinish);
      };

      resume();
    }

    return stream;
  }

  queries() {
    return new DiffQueries(this.paths());
  }

  async stop() {
    if (this.child) {
      this.child.kill('SIGTERM');
    }
  }
}

interface DiffPaths {
  base: string;
  diffs: string;
  diffsStream: string;
  stats: string;
  undocumentedUrls: string;
  events: string;
  ignoreRequests: string;
  filters: string;
  additionalCommands: string;
}

export class DiffQueries implements DiffQueriesInterface {
  constructor(private readonly paths: DiffPaths) {}

  diffs(): Readable {
    if (fs.existsSync(this.paths.diffsStream)) {
      return chain([
        fs.createReadStream(this.paths.diffsStream),
        jsonlParser(),
        (data) => [data.value],
      ]);
    } else {
      let reading = lockedRead<any>(this.paths.diffs);
      let itemsGenerator = jsonStreamGenerator(reading);

      return Readable.from(itemsGenerator);
    }
  }
  undocumentedUrls(): Readable {
    let reading = lockedRead<any>(this.paths.undocumentedUrls);
    let itemsGenerator = jsonStreamGenerator(reading);

    return Readable.from(itemsGenerator);
  }
  stats(): Promise<DiffStats> {
    return lockedRead<DiffStats>(this.paths.stats);
  }
}

async function* jsonStreamGenerator(jsonPromise: Promise<any>) {
  let json = await jsonPromise;

  if (Array.isArray(json)) {
    for await (const item of json) {
      yield item;
    }
  } else {
    yield json;
  }
}

async function lockedRead<T>(filePath: string): Promise<T> {
  await lockfile.lock(filePath, {
    retries: { retries: 10 },
  });

  let json = await fs.readJson(filePath);

  await lockfile.unlock(filePath);

  return json;
}
