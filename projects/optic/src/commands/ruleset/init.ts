import fs from 'fs';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { Command } from 'commander';
import fetch from 'node-fetch';
import { OpticCliConfig } from '../../config';
import tar from 'tar'
import path from 'path';
import chalk from 'chalk';

const owner = 'opticdev';
const repo = 'optic-ci-custom-rules-starter';
const ref = 'main';

export const registerRulesetInit = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('init', {
      hidden: true, // TODO unhide this
    })
    .description('Initializes a new ruleset project')
    .option('--name <name>', 'the name of the new ruleset project')
    .action(wrapActionHandlerWithSentry(getInitAction()));
};

const getInitAction = () => async ({name}: {name?: string}) => {
  const folderToCreate: string | undefined = name && path.join(process.cwd(), name);
  if (folderToCreate) {
    if (fs.existsSync(folderToCreate)){
      console.error(chalk.red(`Cannot create a project named ${name} because a folder ${folderToCreate} already exists.`))
      return process.exit(1);
    }

    fs.mkdirSync(folderToCreate);
  }


  const templateReadStream = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/tarball/${ref}`
  ).then((res) => res.body);
  const tarConfig = folderToCreate ? {
    strip: 1,
    cwd: folderToCreate
  } : {}
  const tarWriteStream = tar.extract(tarConfig);

  await new Promise((resolve) => {
    templateReadStream.pipe(tarWriteStream);
    tarWriteStream.on('finish', resolve);
  });

  // TODO add logging output
  console.log('done');
};
