import { EventEmitter } from 'events';
import { runManagedScriptByName } from '@useoptic/cli-scripts';
import { IDiffProjectionEmitterConfig } from '@useoptic/cli-shared/build/diffs/diff-worker';
import { ChildProcess } from 'child_process';
import { getDiffOutputBaseDirectory } from '../routers/capture-router';

export interface IDiffManagerConfig {
  diffId: string;
  captureId: string;
  captureBaseDirectory: string;
}

export class DiffManager {
  public readonly events: EventEmitter = new EventEmitter();
  private child!: ChildProcess;

  constructor() {}

  async start(config: IDiffManagerConfig) {
    const outputPaths = getDiffOutputBaseDirectory(config);
    const scriptConfig: IDiffProjectionEmitterConfig = {
      captureId: config.captureId,
      diffId: config.diffId,
      captureBaseDirectory: config.captureBaseDirectory,
      specFilePath: outputPaths.events,
      ignoreRequestsFilePath: outputPaths.ignoreRequests,
      additionalCommandsFilePath: outputPaths.additionalCommands,
    };

    const child = runManagedScriptByName(
      'emit-diff-projections',
      JSON.stringify(scriptConfig)
    );
    child.on('message', (x: any) => {
      console.log(x);
      this.events.emit('progress');
    });
    child.on('exit', function () {
      console.log(arguments);
    });
    this.child = child;
  }

  async stop() {
    if (this.child) {
      this.child.kill();
    }
  }
}
