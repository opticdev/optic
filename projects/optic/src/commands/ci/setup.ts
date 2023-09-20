import { Command, Option } from 'commander';
import { OpticCliConfig } from '../../config';
import prompts from 'prompts';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { guessRemoteOrigin } from '../../utils/git-utils';
import { errorHandler } from '../../error-handler';

const configsPath = path.join(__dirname, '..', '..', '..', 'ci', 'configs');

const usage = () => `
  optic ci setup
`;

type Provider = 'github' | 'gitlab';

type CISetupOptions = {
  provider: Provider;
  stdout: boolean;
};

const choices: Provider[] = ['github', 'gitlab'];

export const registerCiSetup = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('setup', { hidden: true })
    .configureHelp({
      commandUsage: usage,
    })
    .description('Generate a CI configuration for Optic')
    .addOption(
      new Option('-p, --provider <provider>', 'provider').choices(choices)
    )
    .option(
      '--stdout',
      'Print the CI config to stdout instead of writing to CI config file.',
      false
    )
    .action(errorHandler(getCiSetupAction(config), { command: 'ci-setup' }));
};

const getCiSetupAction =
  (config: OpticCliConfig) => async (options: CISetupOptions) => {
    let maybeProvider = await guessRemoteOrigin();

    const provider: Provider = options.provider
      ? options.provider
      : (
          await prompts(
            [
              {
                type: 'select',
                name: 'provider',
                message: 'What CI provider would you like to configure?',
                choices: [
                  { title: 'GitHub Actions', value: 'github' },
                  { title: 'GitLab CI/CD', value: 'gitlab' },
                ],

                initial: maybeProvider?.provider === 'gitlab' ? 1 : undefined,
              },
            ],
            { onCancel: () => process.exit(1) }
          )
        ).provider;

    if (provider === 'github') {
      await setupGitHub(config, options);
    } else if (provider === 'gitlab') {
      await setupGitLab(config, options);
    }
  };

async function setupGitHub(config: OpticCliConfig, options: CISetupOptions) {
  const target = '.github/workflows/optic.yml';
  const targetPath = path.join(config.root, target);
  const targetDir = path.dirname(targetPath);
  const shouldContinue = await verifyPath(config.root, target);

  if (!shouldContinue) {
    return;
  }

  await fs.mkdir(targetDir, { recursive: true });

  const fromConfig = path.join(configsPath, 'github.yml');

  let configContent = await fs.readFile(fromConfig, 'utf-8');

  if (options.stdout) {
    console.log(configContent);
  } else {
    await fs.writeFile(path.join(config.root, target), configContent);
    console.log(`${chalk.green('✔')} Wrote CI configuration to ${target}`);

    console.log('');
    console.log('Next:');
    console.log(`- Edit and commit ${target}`);
    console.log(
      '- Configure your standards and authorize Optic to comment on your PRs: https://useoptic.com/docs/setup-ci, then make a change to your OpenAPI files and submit a PR to see Optic in action!'
    );
    console.log(
      '- Check Optic cloud to get hosted preview documentation, visual changelogs and API history: https://www.useoptic.com/docs/cloud-get-started'
    );
  }
}

async function setupGitLab(config: OpticCliConfig, options: CISetupOptions) {
  const target = '.gitlab-ci.yml';
  const targetPath = path.join(config.root, target);
  const targetDir = path.dirname(targetPath);

  let exists = false;
  try {
    await fs.access(targetPath);
    exists = true;
  } catch (e) {
    exists = false;
  }

  const fromConfig = path.join(configsPath, 'gitlab.yml');
  let configContent = await fs.readFile(fromConfig, 'utf-8');

  if (options.stdout) {
    console.log(configContent);
  } else {
    if (!exists) {
      await fs.mkdir(targetDir, { recursive: true });

      await fs.writeFile(targetPath, configContent);

      console.log(`${chalk.green('✔')} Wrote CI configuration to ${target}`);
    } else {
      console.log();
      console.log(
        chalk.green(
          "Since you already have a .gitlab-ci.yml file, here's an example of what you'll need to add:"
        )
      );
      console.log();
      console.log('-- .gitlab-ci.yml -----');
      console.log(configContent.toString());
      console.log('-----------------------');
    }

    console.log('');
    console.log('Next:');
    console.log(`- Edit and commit ${target}`);
    console.log(
      '- Configure your standards and authorize Optic to comment on your MRs: https://useoptic.com/docs/setup-ci, then make a change to your OpenAPI files and submit a MR to see Optic in action!'
    );
    console.log(
      '- Check Optic cloud to get hosted preview documentation, visual changelogs and API history: https://www.useoptic.com/docs/cloud-get-started'
    );
  }
}

async function verifyPath(_root: string, target: string): Promise<boolean> {
  let exists = false;
  try {
    await fs.access(target);
    exists = true;
  } catch (e) {
    exists = false;
  }

  if (exists) {
    const answer = await prompts(
      {
        type: 'confirm',
        name: 'continue',
        message: `Continuing will overwrite the file at ${target}. Continue?`,
      },
      { onCancel: () => process.exit(1) }
    );

    return answer.continue;
  }

  return true;
}
