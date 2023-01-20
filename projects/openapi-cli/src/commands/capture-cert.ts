import { Command } from 'commander';
import { createCommandFeedback, InputErrors } from './reporters/feedback';
import Conf from 'conf';
import Path from 'path';
import { Writable } from 'stream';
import { finished } from 'stream/promises';
import fs from 'fs-extra';
import { ProxyCertAuthority } from '../captures';
import { Option, Some, None } from 'ts-results';
import chalk from 'chalk';
import path from 'path';
import { requireAdmin } from '../require-admin';
import { exec } from 'child_process';

const platform: 'mac' | 'windows' | 'linux' =
  process.platform === 'win32'
    ? 'windows'
    : process.platform === 'darwin'
    ? 'mac'
    : 'linux';

export async function captureCertCommand(): Promise<Command> {
  const command = new Command('setup-tls');

  const feedback = createCommandFeedback(command);

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

      let couldAdd;
      switch (platform) {
        case 'mac': {
          await requireAdmin('Trusting certificate requires sudo. ');

          couldAdd = await tryRunningCertAddCommand(
            `security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${absoluteFilePath}`,
            `Certificate written to optic.local.cert. 
Trust it by running this command with sudo:\n
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${absoluteFilePath}

Once added, you can run 'capture' with TLS targets ie https://api.github.com`
          );

          break;
        }
        /// kill this... it needs to write a cer file their PWD and then they need to go manually trust it, probably, we think
        case 'windows':
          await requireAdmin('Trusting certificate requires Admin.');
          couldAdd = await tryRunningCertAddCommand(
            `powershell "Import-Certificate -FilePath ^"C:${absoluteFilePath}^" -CertStoreLocation cert:\\CurrentUser\\Root`,
            `Certificate written to ${absoluteFilePath}. 
             Trust it: https://superuser.com/questions/463081/adding-self-signed-certificate-to-trusted-root-certificate-store-using-command-l

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

      if (couldAdd) {
        console.log(chalk.green('Certificate trusted'));
        await fs.unlink(absoluteFilePath);
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

async function tryRunningCertAddCommand(
  command: string,
  manualInstructions: string
) {
  return new Promise((resolve, reject) => {
    console.log(`Running: "${command}"`);
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.log(
          chalk.red(
            `could not add certificate: ${err} ${
              stderr || ' '
            }\nPlease follow the manual instructions`
          )
        );
        console.log(manualInstructions);
        return resolve(false);
      }
      resolve(true);
    });
  });
}
