import Command from '@oclif/command';
import Config from '../../config';

export default class Testing extends Command {
  static description = 'Manage Live Contract Testing for your API';
  static hidden: boolean = Config.hiddenFeatures.includes('testing');

  async run() {
    this._help();
  }
}
