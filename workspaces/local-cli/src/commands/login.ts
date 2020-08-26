import { Command, flags } from '@oclif/command';
import {
  ensureCredentialsServerStarted,
  loginBaseUrl,
  tokenReceivedEvent,
  setCredentials,
} from '../shared/authentication-server';
import qs from 'querystring';
import { ensureDaemonStarted, ensureDaemonStopped } from '@useoptic/cli-server';
import { lockFilePath } from '../shared/paths';
import { cli } from 'cli-ux';
import { Config } from '../config';

export default class Login extends Command {
  static description = 'Login to Optic from the CLI';

  static flags = {
    from: flags.string(),
  };

  async run() {
    const { flags } = this.parse(Login);
    try {
      const loginFromUseOptic = flags.from === 'useoptic.com';
      const directLogin = !loginFromUseOptic;

      const { server, port } = await ensureCredentialsServerStarted(
        loginFromUseOptic ? 6782 : undefined
      );

      //also start daemon
      ensureDaemonStarted(lockFilePath, Config.apiBaseUrl);

      const tokenReceived = new Promise<string>((resolve, reject) => {
        server.events.on(tokenReceivedEvent, async (token: string) => {
          resolve(token);
        });
      });

      // trackAndSpawn('Starting login', { loginFromUseOptic });

      const queryString = qs.stringify({
        tokenUrl: `http://localhost:${port}/api/token`,
      });

      if (directLogin) {
        const launchUrl = `${loginBaseUrl}/login?${queryString}`;
        this.log(`Please log in at ${launchUrl}`);
        cli.open(launchUrl); //reload tab behavior is actually undesirable here
        cli.action.start('Waiting for you to login...');
      } else {
        cli.action.start('Waiting to be authenticated...');
      }

      const token = await tokenReceived;
      await setCredentials({ token });
      cli.action.stop('Received Credentials');

      await server.stop();
      this.log(`You are now logged in!`);
    } catch (e) {
      this.error(e);
    }
  }
}
