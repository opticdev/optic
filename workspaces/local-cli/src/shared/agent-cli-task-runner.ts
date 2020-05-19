import Command from '@oclif/command';
import { IOpticTaskRunnerConfig } from '@useoptic/cli-config';
import { IApiCliConfig } from '@useoptic/cli-config';
import { CommandAndProxySessionManager } from './command-and-proxy-session-manager';
import { ICaptureSaver, IOpticTaskRunner } from '@useoptic/cli-shared';

export class AgentCliTaskRunner implements IOpticTaskRunner {
  constructor(private persistenceManager: ICaptureSaver) {}

  async run(
    cli: Command,
    config: IApiCliConfig,
    taskConfig: IOpticTaskRunnerConfig
  ): Promise<void> {
    const sessionManager = new CommandAndProxySessionManager(taskConfig);
    await sessionManager.run(this.persistenceManager);
  }
}
