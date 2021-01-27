import { IApiCliConfig, IOpticTaskRunnerConfig } from '@useoptic/cli-config';
import {
  Command,
  CommandAndProxySessionManager,
  ICaptureSaver,
  IOpticTaskRunner,
} from '@useoptic/cli-shared';

export class AgentCliTaskRunner implements IOpticTaskRunner {
  constructor(private persistenceManager: ICaptureSaver) {}

  foundDiff: boolean = false

  async run(
    cli: Command,
    config: IApiCliConfig,
    taskConfig: IOpticTaskRunnerConfig
  ): Promise<void> {
    const sessionManager = new CommandAndProxySessionManager(taskConfig);
    await sessionManager.run(this.persistenceManager);
  }
}
