import { Command, flags } from '@oclif/command';
import {
  ensureCredentialsServerStarted,
  loginBaseUrl,
  tokenReceivedEvent,
  setCredentials,
} from '../shared/authentication-server';
import qs from 'querystring';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from '../shared/paths';
import { cli } from 'cli-ux';
import { Config } from '../config';

export default class Login extends Command {
  static description = 'Login to Optic from the CLI';

  async run() {
    const { flags } = this.parse(Login);
    try {
      const { server, port } = await ensureCredentialsServerStarted(6782);

      //also start daemon

      const tokenReceived = new Promise<string>((resolve, reject) => {
        server.events.on(tokenReceivedEvent, async (token: string) => {
          resolve(token);
        });
      });

      // trackAndSpawn('Starting login', { loginFromUseOptic });

      const queryString = qs.stringify({
        tokenUrl: `http://localhost:${port}/api/token`,
      });

      cli.action.start('Waiting to be authenticated...');

      let token: string;
      const fallbackTimeout = setTimeout(() => {
        if (!token) {
          const launchUrl = `${loginBaseUrl}/login`;
          this.log(`Please log in at ${launchUrl}`);
          cli.open(launchUrl); //reload tab behavior is actually undesirable here
        }
      }, 5000);
      token = await tokenReceived;
      clearTimeout(fallbackTimeout);
      await setCredentials({ token });
      cli.action.stop('Received Credentials');

      await server.stop();
      await ensureDaemonStarted(lockFilePath, Config.apiBaseUrl);
      this.log(`You are now logged in!`);
    } catch (e) {
      this.error(e);
    }
  }
}
