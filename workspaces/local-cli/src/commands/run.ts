import {Command} from '@oclif/command';
import {setupTask} from '../shared/run-task';

export default class Run extends Command {
  static description = 'Run a task from your optic.yml';

  static args = [{
    name: 'taskName',
  }];

  async run() {
    const {args} = this.parse(Run);
    const {taskName} = args;
    await setupTask(this, taskName);
  }
}
