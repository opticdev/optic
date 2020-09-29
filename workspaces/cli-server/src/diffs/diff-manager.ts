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

  async start(config: IDiffManagerConfig) {
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
    child.on('message', (x: any) => {
      if (x.type && x.type === 'progress') {
        this.lastProgress = { ...x.data };
      }
      this.events.emit(x.type, x.data);
    });
    child.on('exit', function () {
      console.log(arguments);
    });
    this.child = child;
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
