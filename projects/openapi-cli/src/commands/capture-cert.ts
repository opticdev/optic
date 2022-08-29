import { Command } from 'commander';
import { createCommandFeedback, InputErrors } from './reporters/feedback';
import Conf from 'conf';
import Path from 'path';
import { Writable } from 'stream';
import { finished } from 'stream/promises';
import fs from 'fs-extra';
import { ProxyCertAuthority } from '../captures';
import { Option, Some, None } from 'ts-results';

export async function captureCertCommand(): Promise<Command> {
  const command = new Command('cert');

  const feedback = await createCommandFeedback(command);

  command
    .description('manage the CA certificate used to capture TLS traffic')
    .option('-o <output-file>', 'to write CA certificate to in PEM format')
    .option('--del', 'delete the current CA certificate for use')
    .action(async () => {
      const options = command.optsWithGlobals();

      const certStore = getCertStore();

      if (options.del) {
        certStore.delete();
        return await feedback.notable('CA certificate deleted for use');
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

      let destination: Writable;
      const filePath = options.o;
      if (filePath) {
        let absoluteFilePath = Path.resolve(filePath);
        let dirPath = Path.dirname(absoluteFilePath);
        let fileBaseName = Path.basename(filePath);

        if (await fs.pathExists(absoluteFilePath)) {
          return await feedback.inputError(
            `CA certificate cannot be written to a file that already exists.`,
            InputErrors.DESTINATION_FILE_ALREADY_EXISTS
          );
        } else if (!(await fs.pathExists(dirPath))) {
          return await feedback.inputError(
            `to create ${fileBaseName}, dir must exist at ${dirPath}`,
            InputErrors.DESTINATION_FILE_DIR_MISSING
          );
        }

        destination = fs.createWriteStream(absoluteFilePath);
      } else {
        destination = process.stdout;
      }

      await writeCert(ca, destination);
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
