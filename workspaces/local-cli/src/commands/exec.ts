import { Command, flags } from '@oclif/command';
import {
  LocalCliTaskFlags,
  LocalTaskSessionWrapper,
  runCommandFlags,
} from '../shared/local-cli-task-runner';
import { cleanupAndExit, loadPathsAndConfig } from '@useoptic/cli-shared';
import { isCommandOnlyTask } from '@useoptic/cli-config';
import { ingestOnlyTaskRunner } from '../shared/ingest-only-task-runner';

export default class Exec extends Command {
  static description =
    'run a command and receives traffic over an ingest-service';

  static flags = runCommandFlags;

  static args = [
    {
      name: 'command',
    },
  ];

  async run() {
    const { args } = this.parse(Exec);
    const { flags } = this.parse(Exec);
    const { command } = args;
    await ingestOnlyTaskRunner(this, command, flags);
  }
}
