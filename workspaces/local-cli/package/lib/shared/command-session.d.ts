/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
export interface ICommandSessionConfig {
    command: string;
    environmentVariables: NodeJS.ProcessEnv;
}
declare class CommandSession {
    private child?;
    private isRunning;
    events: EventEmitter;
    start(config: ICommandSessionConfig, silent?: boolean): ChildProcess;
    stop(): void;
}
export { CommandSession, };
