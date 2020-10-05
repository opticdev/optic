import { Command } from '@oclif/command';
import {
  LocalTaskSessionWrapper,
  runCommandFlags,
} from '../shared/local-cli-task-runner';

export default class Start extends Command {
  static description = 'starts your API process behind an Optic proxy';

  static flags = runCommandFlags;

  async run() {
    const { flags } = this.parse(Start);
    await LocalTaskSessionWrapper(this, 'start', flags);
  }
}
