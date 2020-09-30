import { EventEmitter } from 'events';
import { runManagedScriptByName } from '@useoptic/cli-scripts';
import {
  getDiffOutputPaths,
  IDiffProjectionEmitterConfig,
} from '@useoptic/cli-shared/build/diffs/diff-worker';
import { ChildProcess } from 'child_process';
import fs from 'fs-extra';
import { readApiConfig } from '@useoptic/cli-config';

export interface IDiffManagerConfig {
  configPath: string;
  diffId: string;
  captureId: string;
  captureBaseDirectory: string;
  specPath: string;
}

export class DiffManager {
  public readonly events: EventEmitter = new EventEmitter();
  private child!: ChildProcess;

  constructor(public readonly id: string) {}

  private lastProgress: {
    diffedInteractionsCounter: string;
    skippedInteractionsCounter: string;
    hasMoreInteractions: string;
  } | null = null;

  async start(config: IDiffManagerConfig): Promise<any> {
    const apiConfig = await readApiConfig(config.configPath);

    const outputPaths = getDiffOutputPaths(config);
    await fs.ensureDir(outputPaths.base);
    await Promise.all([
      fs.copy(config.specPath, outputPaths.events),
      fs.writeJson(outputPaths.ignoreRequests, apiConfig.ignoreRequests || []),
      fs.writeJson(outputPaths.filters, []), // TODO: accept endpoint filters
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
        this.events.emit(
          'error',
          new Error('Diff worker exited with non-zero status code')
        );
      } else {
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
        resolve(data);
      }
      const cleanup = () => {
        this.events.removeListener('progress', onProgress);
        this.events.removeListener('error', onErr);
      };

      this.events.once('progress', onProgress);
      this.events.once('error', onErr);
    });
  }

  latestProgress() {
    const lastProgress = this.lastProgress;
    return lastProgress ? { ...lastProgress } : null;
  }

  async stop() {
    if (this.child) {
      this.child.kill('SIGTERM');
    }
  }
}
