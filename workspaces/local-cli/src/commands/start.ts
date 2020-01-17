import {Command} from '@oclif/command';
import {setupTask} from '../shared/run-task';

export default class Start extends Command {
  static description = 'starts your API process behind a proxy';

  async run() {
    await setupTask(this, 'start');
  }
}
