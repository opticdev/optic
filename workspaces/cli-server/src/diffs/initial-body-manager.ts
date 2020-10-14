import { EventEmitter } from 'events';
import { runManagedScriptByName } from '@useoptic/cli-scripts';
import { ChildProcess } from 'child_process';
import {
  getInitialBodiesOutputPaths,
  IInitialBodiesProjectionEmitterConfig,
} from '@useoptic/cli-shared/build/diffs/initial-bodies-worker';
import { ILearnedBodies } from '@useoptic/cli-shared/build/diffs/initial-types';

export interface IInitialBodyManagerConfig {
  pathId: string;
  method: string;
  captureId: string;
  captureBaseDirectory: string;
}

export class InitialBodyManager {
  public readonly events: EventEmitter = new EventEmitter();
  private child!: ChildProcess;

  async run(config: IInitialBodyManagerConfig): Promise<ILearnedBodies> {
    const outputPaths = getInitialBodiesOutputPaths(config);
    const scriptConfig: IInitialBodiesProjectionEmitterConfig = {
      captureId: config.captureId,
      pathId: config.pathId,
      method: config.method,
      specFilePath: outputPaths.events,
      captureBaseDirectory: config.captureBaseDirectory,
    };
    const child = runManagedScriptByName(
      'emit-initial-bodies-commands',
      JSON.stringify(scriptConfig)
    );

    this.child = child;

    const result: Promise<ILearnedBodies> = new Promise((resolve) => {
      child.on('message', (x: any) => {
        if (!x.data.hasMoreInteractions && x.data.results) {
          this.child.kill('SIGINT');
          resolve(x.data.results);
        }

        this.events.emit(x.type, x.data);
      });
    });

    return await result;
  }

  async stop() {
    if (this.child) {
      this.child.kill('SIGTERM');
    }
  }
}
