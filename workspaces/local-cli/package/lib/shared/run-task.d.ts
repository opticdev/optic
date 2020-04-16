import Command from '@oclif/command';
import { IOpticTaskRunnerConfig } from '@useoptic/cli-config';
import { ICaptureSaver } from '@useoptic/cli-server';
export declare function setupTask(cli: Command, taskName: string): Promise<void>;
export declare function runTask(taskConfig: IOpticTaskRunnerConfig, persistenceManagerFactory: () => ICaptureSaver): Promise<void>;
