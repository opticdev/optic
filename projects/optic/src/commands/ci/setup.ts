import { Command } from 'commander';
import { OpticCliConfig } from '../../config';
import prompts from 'prompts';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import open from 'open';
import { guessRemoteOrigin } from '../../utils/git-utils';
import { errorHandler } from '../../error-handler';
import { getCiSetupUrl } from '../../utils/cloud-urls';

type MaybeProvider = Awaited<ReturnType<typeof guessRemoteOrigin>>;

const configsPath = path.join(__dirname, '..', '..', '..', 'ci', 'configs');

const usage = () => `
  optic ci setup
`;

export const registerCiSetup = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('setup', { hidden: true })
    .configureHelp({
      commandUsage: usage,
    })
    .description(
      'Answer a series of prompts to generate CI configuration for Optic'
    )
    .action(errorHandler(getCiSetupAction(config)));
};

type PromptAnswers = {
  provider: 'GitHub' | 'GitLab';
  standardsFail: boolean;
};

const getCiSetupAction = (config: OpticCliConfig) => async () => {
  let maybeProvider = await guessRemoteOrigin();

  const answers: PromptAnswers = await prompts(
    [
      {
        type: 'select',
        name: 'provider',
        message: 'What CI provider would you like to configure?',
        choices: [
          { title: 'GitHub Actions', value: 'GitHub' },
          { title: 'GitLab CI/CD', value: 'GitLab' },
        ],

        initial: maybeProvider?.provider === 'gitlab' ? 1 : undefined,
      },
      {
        type: 'select',
        name: 'standardsFail',
        message: 'Should failing standards fail CI?',
        choices: [
          { title: 'Yes - Recommended', value: true },
          { title: 'No', value: false },
        ],
      },
    ],
    { onCancel: () => process.exit(1) }
  );

  if (answers.provider === 'GitHub') {
    await setupGitHub(config, maybeProvider, answers);
  } else if (answers.provider === 'GitLab') {
    await setupGitLab(config, maybeProvider, answers);
  }
};

async function setupGitHub(
  config: OpticCliConfig,
  provider: MaybeProvider,
  answers: PromptAnswers
) {
  const target = '.github/workflows/optic.yml';
  const targetPath = path.join(config.root, target);
  const targetDir = path.dirname(targetPath);
  const shouldContinue = await verifyPath(config.root, target);

  if (!shouldContinue) {
    return;
  }

  await fs.mkdir(targetDir, { recursive: true });

  const fromConfig = path.join(
    configsPath,
    answers.standardsFail ? 'github_fail.yml' : 'github_no_fail.yml'
  );

  const configContent = await fs.readFile(fromConfig);
  await fs.writeFile(path.join(config.root, target), configContent);

  console.log();
  console.log(
    `${chalk.green('✔')} Wrote ${
      answers.provider
    } CI configuration to ${target}`
  );

  const instructionsUrl = getCiSetupUrl(
    config.client.getWebBase(),
    provider?.provider,
    provider?.web_url
  );

  console.log();
  console.log(chalk.red("Wait, you're not finished yet"));
  console.log(
    `Before pushing your new GitHub Actions workflow, follow the instructions at ${instructionsUrl} to set up the required secrets in your repository.`
  );

  console.log();

  await openUrlPrompt(instructionsUrl);
}

async function setupGitLab(
  config: OpticCliConfig,
  provider: MaybeProvider,
  answers: PromptAnswers
) {
  const target = '.gitlab-ci.yml';
  const targetPath = path.join(config.root, target);
  const targetDir = path.dirname(targetPath);
  const shouldContinue = await verifyPath(config.root, target);

  if (!shouldContinue) {
    return;
  }

  await fs.mkdir(targetDir, { recursive: true });

  const fromConfig = path.join(
    configsPath,
    answers.standardsFail ? 'gitlab_fail.yml' : 'gitlab_no_fail.yml'
  );

  const configContent = await fs.readFile(fromConfig);
  await fs.writeFile(path.join(config.root, target), configContent);

  console.log();
  console.log(
    `${chalk.green('✔')} Wrote ${
      answers.provider
    } CI configuration to ${target}`
  );

  const instructionsUrl = getCiSetupUrl(
    config.client.getWebBase(),
    provider?.provider,
    provider?.web_url
  );

  console.log();
  console.log(chalk.red("Wait, you're not finished yet"));
  console.log(
    'Before pushing your new GitLab CI/CD pipeline, follow the instructions at\n' +
      `${instructionsUrl} to set up the required secrets in your repository.`
  );
  console.log();

  await openUrlPrompt(instructionsUrl);
}

async function verifyPath(root: string, target: string): Promise<boolean> {
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

async function openUrlPrompt(url: string) {
  const answer = await prompts(
    {
      type: 'confirm',
      name: 'open',
      message: `Open setup instructions in your browser?`,
      initial: true,
    },
    { onCancel: () => process.exit(1) }
  );

  if (answer.open) {
    await open(url, { wait: false });
  }

  return;
}
