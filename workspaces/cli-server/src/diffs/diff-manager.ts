import { EventEmitter } from 'events';
import { runManagedScriptByName } from '@useoptic/cli-scripts';
import {
  getDiffOutputPaths,
  IDiffProjectionEmitterConfig,
} from '@useoptic/cli-shared/build/diffs/diff-worker';
import { ChildProcess } from 'child_process';

export interface IDiffManagerConfig {
  diffId: string;
  captureId: string;
  captureBaseDirectory: string;
}

export class DiffManager {
  public readonly events: EventEmitter = new EventEmitter();
  private child!: ChildProcess;

  async start(config: IDiffManagerConfig) {
    const outputPaths = getDiffOutputPaths(config);
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
      console.log(x);
      this.events.emit(x.type, x.data);
    });
    child.on('exit', function () {
      console.log(arguments);
    });
    this.child = child;
  }

  async stop() {
    if (this.child) {
      this.child.kill('SIGTERM');
    }
  }
}
