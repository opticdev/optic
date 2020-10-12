import { IOpticTaskRunner, Command } from '../index';
import {
  IApiCliConfig,
  IOpticTaskRunnerConfig,
  TargetPortUnavailableError,
  TaskNotFoundError,
  TaskToStartConfig,
} from '@useoptic/cli-config';
import colors from 'colors';
import { errorFromOptic } from '../conversation';

export class CliTaskSession {
  constructor(private runner: IOpticTaskRunner) {}

  async start(
    cli: Command,
    config: IApiCliConfig,
    taskName: string,
    commandToRunWhenStarted?: string
  ): Promise<void> {
    try {
      const task = config.tasks[taskName];
      if (!task) {
        throw new TaskNotFoundError(taskName);
      }
      const taskConfig = await TaskToStartConfig(task);
      await this.runner.run(cli, config, taskConfig, commandToRunWhenStarted);
    } catch (e) {
      if (e instanceof TargetPortUnavailableError) {
        cli.log(errorFromOptic(e.message));
      } else if (e instanceof TaskNotFoundError) {
        cli.log(
          errorFromOptic(
            `No task named ${colors.bold(taskName)} found in optic.yml`
          )
        );
      } else {
        cli.error(e);
      }
    }
  }
}
