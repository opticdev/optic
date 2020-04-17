import {Command} from '@oclif/command';
import openBrowser = require("react-dev-utils/openBrowser");

export default class Login extends Command {
  static description = 'Login to Optic from the CLI';
  async run() {
    openBrowser('https://auth.useoptic.com/login')
  }
}
