import Command from '@oclif/command';

export default class Testing extends Command {
  static description = 'Manage Live Contract Testing for your API';

  async run() {
    this._help();
  }
}
