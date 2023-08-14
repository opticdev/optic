import { Command } from 'commander';
import { createCommandFeedback } from './reporters/feedback';
import Conf from 'conf';
import Path from 'path';
import { Writable } from 'stream';
import { finished } from 'stream/promises';
import fs from 'fs-extra';
import { Option, Some, None } from 'ts-results';
import chalk from 'chalk';
import path from 'path';
import { exitIfNotElevated, platform, runCommand } from './lib/shell-utils';
import { ProxyCertAuthority } from './captures/proxy';

export async function setupTlsCommand(): Promise<Command> {
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

      async function writeCertNamed(name: string) {
        const certPath = path.join('.', name);
        let absoluteFilePath = Path.resolve(certPath);
        const destination: Writable = fs.createWriteStream(absoluteFilePath);
        await writeCert(ca, destination);
        return absoluteFilePath;
      }

      console.log(
        'Hey Optic here. We take privacy seriously so we wanted to let you know how intercepting TLS traffic works: A self-signed certificate generated on your machine (we do not have it) is added to your trust chain. That allows the Optic proxy to read TLS traffic that is sent through it. The CLI will save TLS traffic to the target host (your API) in the tmp directory. It is never sent to us and all the processing happens locally. All the code is Open Source https://github.com/opticdev/optic'
      );

      switch (platform) {
        case 'mac': {
          await exitIfNotElevated(
            'Run this command with sudo to trust the certificate'
          );
          const certFilePath = await writeCertNamed('optic.local.cert');

          console.log(
            'Trusting Cert. This may take a few seconds. If you see a Keychain prompt appear, enter your password'
          );

          try {
            await runCommand(
              `security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certFilePath}`
            );
            console.log(
              chalk.green(
                "Certificate trusted. 'oas capture' can now see traffic sent to https hosts when Optic is running"
              )
            );
            await fs.unlink(certFilePath);
          } catch (e) {
            console.error(chalk.red('Error trusting certificate ' + e));
            console.error(
              chalk.red(
                'Try trusting it manually. It has been written to  ' +
                  certFilePath
              )
            );
          }

          break;
        }
        case 'windows': {
          const certFilePath = await writeCertNamed('optic.local.crt');

          console.log(
            `Certificate written to ${certFilePath}. Right-click and choose "Install" 
             Trust it: https://techcommunity.microsoft.com/t5/windows-server-essentials-and/installing-a-self-signed-certificate-as-a-trusted-root-ca-in/ba-p/396105

Once added, you can run 'capture' with TLS targets ie https://api.github.com`
          );
          break;
        }
        case 'linux': {
          const certFilePath = await writeCertNamed('optic.local.cert');

          console.log(
            `Certificate written to ${certFilePath}. Depending on your distro, the commands to trust the certificate are different.

Once added, you can run 'capture' with TLS targets ie https://api.github.com`
          );
          break;
        }
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
