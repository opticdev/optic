import { Command } from '@oclif/command';
import { verifyTask } from '../shared/verify/verify';

export default class Check extends Command {
  static description = 'Validate the correctness of a task in your optic.yml';

  static args = [
    {
      name: 'taskName',
    },
  ];

  async run() {
    const { args } = this.parse(Check);
    const { taskName } = args;
    await verifyTask(this, taskName);
  }
}
