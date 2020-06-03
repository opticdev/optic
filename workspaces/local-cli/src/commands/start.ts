import { Command } from '@oclif/command';
import { LocalTaskSessionWrapper } from '../shared/local-cli-task-runner';

export default class Start extends Command {
  static description = 'starts your API process behind an Optic proxy';

  async run() {
    await LocalTaskSessionWrapper(this, 'start');
  }
}
