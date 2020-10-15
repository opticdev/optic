import { EventEmitter } from 'events';
import { runManagedScriptByName } from '@useoptic/cli-scripts';
import {
  getDiffOutputPaths,
  IDiffProjectionEmitterConfig,
} from '@useoptic/cli-shared/build/diffs/diff-worker';
import { ChildProcess } from 'child_process';
import fs from 'fs-extra';
import { readApiConfig } from '@useoptic/cli-config';

import lockfile from 'proper-lockfile';
import { Readable, PassThrough } from 'stream';
import { chain } from 'stream-chain';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { parser as jsonlParser } from 'stream-json/jsonl/Parser';
import { parser as jsonParser } from 'stream-json';
import { DiffQueries, IAsyncTask } from '../diffs';
import {
  getInitialBodiesOutputPaths,
  IInitialBodiesProjectionEmitterConfig,
} from '@useoptic/cli-shared/build/diffs/initial-bodies-worker';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';

export interface IInitialBodyManagerConfig {
  pathId: string;
  method: string;
  captureId: string;
  events: any;
  captureBaseDirectory: string;
}

export class OnDemandInitialBody implements IAsyncTask {
  public readonly events: EventEmitter = new EventEmitter();
  private child!: ChildProcess;
  public readonly id: string;
  private readonly config: IInitialBodyManagerConfig;
  private finished: boolean = false;

  constructor(config: IInitialBodyManagerConfig) {
    this.id = config.method + config.method + config.captureId;
    this.config = config;
  }

  private lastProgress: {
    hasMoreInteractions: boolean;
    results: ILearnedBodies;
  } | null = null;

  async start(): Promise<any> {
    const { config } = this;

    const outputPaths = this.paths();

    const scriptConfig: IInitialBodiesProjectionEmitterConfig = {
      captureId: config.captureId,
      pathId: config.pathId,
      method: config.method,
      specFilePath: outputPaths.events,
      captureBaseDirectory: config.captureBaseDirectory,
    };

    await fs.ensureDir(outputPaths.base);

    await Promise.all([fs.writeJson(outputPaths.events, config.events)]);

    console.log(JSON.stringify(scriptConfig));

    const child = runManagedScriptByName(
      'emit-initial-bodies-commands',
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
        console.error('IAsyncTask Worker exited with non-zero exit code');
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

  private paths(): { base: string; events: string; initialBodies: string } {
    return getInitialBodiesOutputPaths(this.config);
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

  async stop() {
    if (this.child) {
      this.child.kill('SIGTERM');
    }
  }

  queries(): DiffQueries {
    throw new Error('unimplemented');
  }
}
