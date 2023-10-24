import fs from 'node:fs/promises';
import { Command } from 'commander';
import fetch from 'node-fetch';
import { OpticCliConfig } from '../../config';
import tar from 'tar';
import path from 'path';
import chalk from 'chalk';
import { errorHandler } from '../../error-handler';

const DEFAULT_INIT_FOLDER = 'optic-ruleset';
const owner = 'opticdev';
const repo = 'optic-custom-rules-starter';
const ref = 'main';
const NAME_PLACEHOLDER = 'name-of-custom-rules-package';

export const registerRulesetInit = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('init')
    .description('Initializes a new ruleset project')
    .argument('[name]', 'the name of the new ruleset project')
    .action(errorHandler(getInitAction(), { command: 'ruleset-init' }));
};

const getInitAction = () => async (name?: string) => {
  const projectName = name ?? DEFAULT_INIT_FOLDER;
  console.log(
    chalk.bold.blue(
      `Initializing ${
        name ? `project ${name}` : 'a new optic ruleset project'
      }...`
    )
  );
  const folderToCreate = path.join(process.cwd(), projectName);
  try {
    await fs.access(folderToCreate);
    console.error(
      chalk.red(
        `Cannot create a project named ${projectName} because a folder ${folderToCreate} already exists.`
      )
    );
    return process.exit(1);
  } catch (e) {}

  await fs.mkdir(folderToCreate);

  console.log();
  console.log(`Downloading template...`);
  console.log();

  const templateReadStream = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/tarball/${ref}`
  ).then((res) => res.body);
  const tarConfig = folderToCreate
    ? {
        strip: 1,
        cwd: folderToCreate,
      }
    : {};
  const tarWriteStream = tar.extract(tarConfig);

  await new Promise((resolve) => {
    templateReadStream.pipe(tarWriteStream);
    tarWriteStream.on('finish', resolve);
  });

  // update file names and dependencies
  const rulesFilePath = path.join(folderToCreate, 'src', 'main.ts');
  const packageJsonFilePath = path.join(folderToCreate, 'package.json');
  const dependencies = [
    '@useoptic/rulesets-base',
    '@useoptic/openapi-utilities',
  ];
  const latestVersion = (await import('latest-version')).default;
  const version = await latestVersion(dependencies[0]);

  await fs
    .readFile(rulesFilePath, 'utf-8')
    .then((file) => file.replaceAll(NAME_PLACEHOLDER, projectName))
    .then((file) => fs.writeFile(rulesFilePath, file));
  await fs
    .readFile(packageJsonFilePath, 'utf-8')
    .then((file) => file.replaceAll(NAME_PLACEHOLDER, projectName))
    .then((file) =>
      dependencies.reduce(
        (f, dep) => f.replace(`"${dep}": "*"`, `"${dep}": "^${version}"`),
        file
      )
    )
    .then((file) => fs.writeFile(packageJsonFilePath, file));

  console.log(
    chalk.green.bold(`Successfully initialized your optic ruleset project!`),
    folderToCreate
  );
  console.log();
  console.log(
    `Your newly created project has been created at:`,
    folderToCreate
  );
  console.log(
    `Get started by reading the README at: ${folderToCreate}/README.md and installing the project dependencies (npm install or yarn install)`
  );
};
