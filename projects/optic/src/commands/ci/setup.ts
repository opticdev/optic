import { Command } from 'commander';
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

const matchPlaceholder = 'replace-me-openapi.yml';
const generatePlaceholder = 'replace-me-generate.sh';

export const registerCiSetup = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('setup')
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
  generatedSpecs: boolean;
  generateScript: string;
  match: string;
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
      {
        type: 'select',
        name: 'generatedSpecs',
        message: 'Do you use a script to generate your OpenAPI specs?',
        choices: [
          { title: 'Yes', value: true },
          { title: 'No', value: false },
        ],
        initial: 1,
      },
      {
        type: (prev) => (prev === true ? 'text' : null),
        name: 'generateScript',
        message:
          'The script or command you use to genrate your specs (ex: generate.sh)',
      },
      {
        type: 'text',
        name: 'match',
        message:
          'Path to your OpenAPI spec files (examples: "first-spec.yml,second-spec.yml" or "**/spec.yml")',
      },
    ],
    { onCancel: () => process.exit(1) }
  );

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
    answers.generatedSpecs ? 'github_generated_spec.yml' : 'github.yml'
  );

  let configContent = await fs.readFile(fromConfig, 'utf-8');
  const standardsValue = answers.standardsFail ? 'true' : 'false';
  configContent = configContent.replace('%standards_fail', standardsValue);

  const generateScript = answers.generateScript || generatePlaceholder;
  configContent = configContent.replace('%generate_script', generateScript);

  const match = answers.match || matchPlaceholder;
  configContent = configContent.replace('%match', match);

  await fs.writeFile(path.join(config.root, target), configContent);

  console.log(
    `${chalk.green('✔')} Wrote ${
      answers.provider
    } CI configuration to ${target}`
  );

  console.log('');
  console.log('Next:');
  if (!answers.match)
    console.log(
      `- Replace "${matchPlaceholder}" with your OpenAPI paths in the generated file (examples: "first-spec.yml,second-spec.yml" or "**/spec.yml").`
    );
  if (answers.generatedSpecs && !answers.generateScript)
    console.log(
      `- Replace "${generatePlaceholder}" with your generate command or script in the generated file.`
    );
  console.log('- Commit the generated CI file.');
  console.log(
    '- Configure your standards and authorize Optic to comment on your PRs: https://useoptic.com/docs/setup-ci, then change your OpenAPI files and submit a PR to see Optic in action!'
  );
  console.log(
    '- Check Optic cloud to get hosted preview documentation, visual changelogs and API history: https://www.useoptic.com/docs/cloud-get-started'
  );
}

async function setupGitLab(config: OpticCliConfig, answers: PromptAnswers) {
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

  const fromConfig = path.join(
    configsPath,
    answers.generatedSpecs ? 'gitlab_generated_spec.yml' : 'gitlab.yml'
  );
  let configContent = await fs.readFile(fromConfig, 'utf-8');
  const standardsValue = answers.standardsFail ? '' : '# ';
  configContent = configContent.replaceAll('%standards_fail', standardsValue);

  const generateScript = answers.generateScript || generatePlaceholder;
  configContent = configContent.replaceAll('%generate_script', generateScript);

  const match = answers.match || matchPlaceholder;
  configContent = configContent.replaceAll('%match', match);

  if (!exists) {
    await fs.mkdir(targetDir, { recursive: true });

    await fs.writeFile(targetPath, configContent);

    console.log(
      `${chalk.green('✔')} Wrote ${
        answers.provider
      } CI configuration to ${target}`
    );
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
  if (!answers.match)
    console.log(
      `- Replace "${matchPlaceholder}" with your OpenAPI paths in the generated file (ex: openapi.yml,other.yml).`
    );
  if (answers.generatedSpecs && !answers.generateScript)
    console.log(
      `- Replace "${generatePlaceholder}" with your generate command or script in the generated file.`
    );

  console.log('- Commit the generated file.');
  console.log(
    '- Configure your standards and authorize Optic to comment on your MRs: https://useoptic.com/docs/setup-ci, then change your OpenAPI files and submit a MR to see Optic in action!'
  );
  console.log(
    `- Change your OpenAPI files and submit a MR to see Optic in action!`
  );
  console.log(
    '- Visit https://www.useoptic.com/cloud to learn about integrating your CI setup with Optic cloud.'
  );
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
