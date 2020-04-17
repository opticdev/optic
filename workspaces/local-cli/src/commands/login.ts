import { Command } from '@oclif/command';
import openBrowser = require('react-dev-utils/openBrowser');
import {
  ensureCredentialsServerStarted,
  loginBaseUrl,
  tokenReceivedEvent,
  setCredentials
} from '../shared/authentication-server';
import * as url from 'url';
import * as qs from 'querystring';
import { ensureDaemonStopped } from '@useoptic/cli-server';
import { lockFilePath } from '../shared/paths';
import {cli} from "cli-ux";

export default class Login extends Command {
  static description = 'Login to Optic from the CLI';

  async run() {
    try {
      const { server, port } = await ensureCredentialsServerStarted();
      const tokenReceived = new Promise<string>((resolve, reject) => {
        server.events.on(tokenReceivedEvent, async (token: string) => {
          resolve(token);
        });
      });

      const queryString = qs.stringify({
        tokenUrl: `http://localhost:${port}/api/token`
      });
      const launchUrl = `${loginBaseUrl}/login?${queryString}`
      this.log(`Please log in at ${launchUrl}`);

      cli.action.start('Waiting for you to login...')

      cli.open(launchUrl) //reload tab behavior is actually undesirable here

      const token = await tokenReceived;
      await setCredentials({token});
      cli.action.stop('Received Credentials')

      await server.stop();
      await ensureDaemonStopped(lockFilePath);
      this.log(`You are now logged in!`);
    } catch (e) {
      this.error(e);
    }
  }
}
