import {ChildProcess, spawn, SpawnOptions} from 'child_process';
import {EventEmitter} from 'events';
import * as treeKill from 'tree-kill';
import {developerDebugLogger} from './logger';

export interface ICommandSessionConfig {
  command: string
  environmentVariables: NodeJS.ProcessEnv
}

class CommandSession {
  private child?: ChildProcess;
  private isRunning: boolean = false;
  public events: EventEmitter = new EventEmitter();

  start(config: ICommandSessionConfig) {
    const taskOptions: SpawnOptions = {
      env: {
        ...process.env,
        ...config.environmentVariables,
      },
      shell: true,
      cwd: process.cwd(),
      stdio: 'inherit',
    };

    this.isRunning = true;

    this.child = spawn(config.command, taskOptions);

    this.events.once('stopped', (e) => {
      this.isRunning = false;
    });
    this.child.on('exit', (code) => {
      developerDebugLogger(`command process exited with code ${code}`)
      this.events.emit('stopped', {state: code ? 'failed' : 'completed'});
    });

    return this.child;
  }

  stop() {
    if (this.isRunning && this.child) {
      treeKill(this.child.pid, (e) => {
        if (e) {
          console.error(e);
        }
        this.events.emit('stopped', {state: 'terminated'});
      });
    }
  }
}

export {
  CommandSession,
};
