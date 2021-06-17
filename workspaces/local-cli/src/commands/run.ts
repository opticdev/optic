import { Command, flags } from '@oclif/command';
import {
  LocalTaskSessionWrapper,
  runCommandFlags,
} from '../shared/local-cli-task-runner';
import { cleanupAndExit, loadPathsAndConfig } from '@useoptic/cli-shared';
import { isCommandOnlyTask } from '@useoptic/cli-config';
import Exec from './exec';
import { ingestOnlyTaskRunner } from '../shared/ingest-only-task-runner';

export default class Run extends Command {
  static description = 'run tasks from your optic.yml';

  static flags = runCommandFlags;

  static args = [
    {
      name: 'taskName',
    },
  ];

  async run() {
    const { args } = this.parse(Run);
    const { flags } = this.parse(Run);
    const { taskName } = args;

    const { config } = await loadPathsAndConfig(this);

    const task = config.tasks[taskName];
    if (taskName && task && isCommandOnlyTask(task)) {
      // this is an ingest-only use case
      await ingestOnlyTaskRunner(this, task.command!, flags);
    } else {
      // this is a local proxy use case
      await LocalTaskSessionWrapper(this, taskName, flags);
      cleanupAndExit();
    }
  }
}
