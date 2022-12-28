import { Command } from 'commander';
import { createCommandFeedback, InputErrors } from './reporters/feedback';
import Conf from 'conf';
import Path from 'path';
import { Writable } from 'stream';
import { finished } from 'stream/promises';
import fs from 'fs-extra';
import { ProxyCertAuthority } from '../captures';
import { Option, Some, None } from 'ts-results';
import readline from 'readline';
import chalk from 'chalk';
import path from 'path';

const platform: 'mac' | 'windows' | 'linux' =
  process.platform === 'win32'
    ? 'windows'
    : process.platform === 'darwin'
    ? 'mac'
    : 'linux';

export async function captureCertCommand(): Promise<Command> {
  const command = new Command('setup-tls');

  const feedback = await createCommandFeedback(command);

  command
    .description(
      'trust a CA certificate (generated on your machine) to capture TLS traffic'
    )
    .option('--del', 'delete the current CA certificate for use')
    .action(async () => {
      const options = command.optsWithGlobals();

      const certStore = getCertStore();

      if (options.del) {
        certStore.delete();
        return feedback.notable('CA certificate deleted for use by proxy');
      }

      console.log(`We take privacy seriously. You should understand how Optic's TLS capturing works:

THe Optic proxy is a man-in-the-middle proxy that only runs on and logs data to your local machine. 
 
1. The 'capture' command assigns your system proxy settings when starting, and restores them upon exit. Most clients will respect those settings and route traffic through Optic.
2. The Optic proxy transparently routes all traffic to its destination, even traffic it can not read.
3. The Optic proxy is also a man-in-the-middle. It tries to read traffic to your API hostnames: i.e. localhost:3005 or https://api.example.com to learn and verify API behaviors

By default, there is no way for Optic to read any TLS traffic. If you want to use Optic to read TLS traffic, it will need a trusted CA Certification. This setup wizard will:

1. Generate a CA Certificate on your local machine (it will not phone it home)
2. Add that certificate to your trust chain 
3. Use that Cert to terminate TLS and log traffic from the target hostnames. 

If you do this, you are man-in-the-middling yourself. Optic will theoretically be able to see any TLS traffic when the 'capture' command is activated.   
You are welcome to read the source code github.com/opticdev/optic
`);

      const answer = await ContinueSetup();

      if (!answer) {
        process.exit(0);
      }

      let maybeCa = certStore.get();
      let ca: ProxyCertAuthority;
      if (
        maybeCa.none ||
        ProxyCertAuthority.hasExpired(maybeCa.val, new Date())
      ) {
        ca = await ProxyCertAuthority.generate();
        certStore.set(ca);
        await feedback.instruction(
          `Generated a CA certificate for HTTPS requests`
        );
      } else {
        ca = maybeCa.val;
      }

      const certPath = path.join('.', 'optic.local.cert');
      let absoluteFilePath = Path.resolve(certPath);
      const destination: Writable = fs.createWriteStream(absoluteFilePath);
      await writeCert(ca, destination);

      switch (platform) {
        case 'mac': {
          console.log(
            `Certificate written to optic.local.cert. 
Trust it by running this command with sudo:\n
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${absoluteFilePath}

Once added, you can run 'capture' with TLS targets ie https://api.github.com`
          );
          break;
        }
        case 'windows':
          console.log(
            `Certificate written to ${absoluteFilePath}. 
             Trust it: https://techcommunity.microsoft.com/t5/windows-server-essentials-and/installing-a-self-signed-certificate-as-a-trusted-root-ca-in/ba-p/396105

Once added, you can run 'capture' with TLS targets ie https://api.github.com`
          );
          break;
        case 'linux':
          console.log(
            `Certificate written to ${absoluteFilePath}. Depending on your distro, the commands to trust the certificate are different.

Once added, you can run 'capture' with TLS targets ie https://api.github.com`
          );
          break;
      }
      process.exit(0);
    });
  return command;
}

async function writeCert(
  ca: ProxyCertAuthority,
  destination: Writable
): Promise<void> {
  let cert = ProxyCertAuthority.readableCert(ca);

  await finished(cert.pipe(destination));
}

export function getCertStore() {
  let configStore = new Conf({
    projectName: '@useoptic/openapi-cli',
    schema: {
      'capture-proxy-ca': {
        type: 'object',
        properties: {
          cert: {
            type: 'string',
          },
          key: {
            type: 'string',
          },
        },
      },
    },
  });

  return {
    get: (): Option<ProxyCertAuthority> => {
      const maybeCa = configStore.get('capture-proxy-ca');
      if (maybeCa) {
        return Some(maybeCa as ProxyCertAuthority);
      } else {
        return None;
      }
    },
    set: (ca: ProxyCertAuthority): void => {
      configStore.set('capture-proxy-ca', ca);
    },
    delete(): void {
      return configStore.delete('capture-proxy-ca');
    },
  };
}

export type CertStore = ReturnType<typeof getCertStore>;

async function ContinueSetup(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question(chalk.bold.blue('Continue setup? yes/no: '), function (answer) {
      if (
        answer === 'yes' ||
        answer === 'Yes' ||
        answer === 'y' ||
        answer === 'Y'
      ) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    rl.on('close', function () {
      process.exit(0);
    });
  });
}
