import { Command } from 'commander';
import { OpticCliConfig } from '../../config';
import prompts from 'prompts';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import open from 'open';
import { getRemoteUrl, remotes } from '../../utils/git-utils';
import { getApiAddAction } from '../api/add';
import { errorHandler } from '../../error-handler';

const configsPath = path.join(__dirname, '..', '..', '..', 'ci', 'configs');

const githubInstructions = 'https://www.useoptic.com/docs/github';
const gitlabInstructions = 'https://www.useoptic.com/docs/gitlab';

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
  discover: boolean;
};

const getCiSetupAction = (config: OpticCliConfig) => async () => {
  let maybeProvider = await guessProvider();

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

        initial: maybeProvider === 'GitLab' ? 1 : undefined,
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
      {
        type: 'select',
        name: 'discover',
        message:
          'Would you like to discover API specs in the current repository?',
        choices: [
          { title: 'Yes - Recommended', value: true },
          { title: 'No', value: false },
        ],
      },
    ],
    { onCancel: () => process.exit(1) }
  );

  if (answers.discover) {
    console.log();
    console.log(`${chalk.green('✔')} Discovering API specs in your repo`);

    try {
      await getApiAddAction(config)(undefined, {
        historyDepth: '1',
        all: true,
      });
      console.log(`${chalk.green('✔')} Discovery complete`);
    } catch (e) {
      console.log(
        chalk.red(`Discovery failed with error: ${(e as Error).message}`)
      );
      console.log('Continuing.');
    }

    console.log();
  }

  if (answers.provider === 'GitHub') {
    await setupGitHub(config, answers);
  } else if (answers.provider === 'GitLab') {
    await setupGitLab(config, answers);
  }
};

async function setupGitHub(config: OpticCliConfig, answers: PromptAnswers) {
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

  console.log();
  console.log(chalk.red("Wait, you're not finished yet"));
  console.log(
    'Before pushing your new GitHub Actions workflow, follow the instructions at\n' +
      `${githubInstructions} to set up the required secrets in your repository.`
  );
  console.log();

  await openUrlPrompt(githubInstructions);
}

async function setupGitLab(config: OpticCliConfig, answers: PromptAnswers) {
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

  console.log();
  console.log(chalk.red("Wait, you're not finished yet"));
  console.log(
    'Before pushing your new GitLab CI/CD pipeline, follow the instructions at\n' +
      `${gitlabInstructions} to set up the required secrets in your repository.`
  );
  console.log();

  await openUrlPrompt(gitlabInstructions);
}

async function guessProvider(): Promise<PromptAnswers['provider'] | ''> {
  let remoteUrl: string;

  try {
    const gitRemotes = await remotes();
    if (gitRemotes.length === 0) {
      return '';
    }

    remoteUrl = await getRemoteUrl(gitRemotes[0]);
  } catch (e) {
    return '';
  }

  if (remoteUrl.includes('github')) {
    return 'GitHub';
  }

  if (remoteUrl.includes('gitlab')) {
    return 'GitLab';
  }

  return '';
}

async function verifyPath(root: string, target: string): Promise<boolean> {
  const fullPath = path.join(root, target);

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
        message: `Continuing will ovewrite the file at ${target}. Continue?`,
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
      message: `Open ${url} in your browser?`,
      initial: true,
    },
    { onCancel: () => process.exit(1) }
  );

  if (answer.open) {
    await open(url, { wait: false });
  }

  return;
}
