import fs from 'fs';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { Command } from 'commander';
import fetch from 'node-fetch';
import { OpticCliConfig } from '../../config';
import tar from 'tar';
import path from 'path';
import chalk from 'chalk';

const DEFAULT_INIT_FOLDER = 'optic-ruleset';
const owner = 'opticdev';
const repo = 'optic-ci-custom-rules-starter'; // TODO update this to point at a
const ref = 'main';

export const registerRulesetInit = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('init', {
      hidden: true, // TODO unhide this
    })
    .description('Initializes a new ruleset project')
    .argument('[name]', 'the name of the new ruleset project')
    .action(wrapActionHandlerWithSentry(getInitAction()));
};

const getInitAction = () => async (name?: string) => {
  console.log(
    chalk.bold.blue(
      `Initializing ${
        name ? `project ${name}` : 'a new optic ruleset project'
      }...`
    )
  );
  const folderToCreate = path.join(process.cwd(), name ?? DEFAULT_INIT_FOLDER);
  if (fs.existsSync(folderToCreate)) {
    console.error(
      chalk.red(
        `Cannot create a project named ${name} because a folder ${folderToCreate} already exists.`
      )
    );
    return process.exit(1);
  }

  fs.mkdirSync(folderToCreate);

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

  console.log(
    chalk.green.bold(
      `Successfully initialized your optic ruleset project!`
    ),
    folderToCreate
  );
  console.log();
  console.log(`Your newly created project has been created at:`, folderToCreate)
  console.log(
    `Get started by reading the README at: ${folderToCreate}/README.md and installing the project dependencies (npm install or yarn install)`
  );
};
