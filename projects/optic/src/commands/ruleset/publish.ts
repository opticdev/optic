import { Command } from 'commander';
import { OpticCliConfig, VCS } from '../../config';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';

import chalk from 'chalk';

export const registerRulesetPublish = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('publish', {
      hidden: true,
    })
    // .configureHelp({
    //   commandUsage: usage,
    // })
    // .addHelpText('after', helpText)
    // .description(description)
    
    // TODO add args


    .action(wrapActionHandlerWithSentry(getPublishAction(config)));
};

const getPublishAction = (config: OpticCliConfig) => async () => {}