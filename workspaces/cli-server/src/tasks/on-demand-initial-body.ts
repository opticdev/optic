import { EventEmitter } from 'events';
import { runManagedScriptByName } from '@useoptic/cli-scripts';
import { ChildProcess } from 'child_process';
import fs from 'fs-extra';
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

export class OnDemandInitialBody {
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

  async run(): Promise<ILearnedBodies> {
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

    const child: ChildProcess = runManagedScriptByName(
      'emit-initial-bodies-commands',
      JSON.stringify(scriptConfig)
    );

    const onMessage = (x: any) => {
      if (x.type && x.type === 'progress') {
        if (!x.data.hasMoreInteractions) {
          this.finished = true;
          this.events.emit('completed', x.data);
        }
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
        console.error(
          `On Demand Body Worker exited with non-zero exit code ${code}`
        );
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

    const completedPromise: Promise<ILearnedBodies> = new Promise((resolve) => {
      this.events.once('completed', onCompleted);
      function onCompleted(data: any) {
        cleanup();
        child.kill();
        resolve(data.results);
      }
      const cleanup = () => {
        this.events.removeListener('completed', onCompleted);
      };
    });

    const startedPromise = await new Promise(async (resolve, reject) => {
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

    await startedPromise;
    return await completedPromise;
  }

  private paths(): { base: string; events: string; initialBodies: string } {
    return getInitialBodiesOutputPaths(this.config);
  }

  async stop() {
    if (this.child) {
      this.child.kill('SIGTERM');
    }
  }
}
