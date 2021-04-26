import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { EventEmitter } from 'events';
import treeKill from 'tree-kill';
import { developerDebugLogger } from './index';

export interface ICommandSessionConfig {
  command: string;
  environmentVariables: NodeJS.ProcessEnv;
}

class CommandSession {
  public exitCode: number | null = null
  private child?: ChildProcess;
  private isRunning: boolean = false;
  public events: EventEmitter = new EventEmitter();

  start(config: ICommandSessionConfig, silent: boolean = false) {
    const taskOptions: SpawnOptions = {
      env: {
        ...process.env,
        ...config.environmentVariables,
      },
      shell: true,
      cwd: process.cwd(),
      stdio: silent ? 'ignore' : 'inherit',
    };

    this.isRunning = true;

    this.child = spawn(config.command, taskOptions);

    this.events.once('stopped', (e) => {
      this.isRunning = false;
    });
    this.child.on('exit', (code, signal) => {
      this.exitCode = code
      developerDebugLogger(
        `command process exited with code ${code} and signal ${signal}`
      );
      this.events.emit('stopped', { state: code ? 'failed' : 'completed' });
    });

    return this.child;
  }

  stop() {
    if (this.isRunning && this.child) {
      const pid = this.child.pid;
      return new Promise((resolve) => {
        treeKill(pid, (e) => {
          if (e) {
            developerDebugLogger(`Issue killing child process: ${e}`);
          }
          this.events.emit('stopped', { state: 'terminated' });
          resolve();
        });
      });
    }
  }
}

export { CommandSession };
