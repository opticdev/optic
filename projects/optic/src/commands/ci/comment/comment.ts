import { Command } from 'commander';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';

import { OpticCliConfig } from '../../../config';

export const registerCiComment = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('comment', { hidden: true })
    .description('comment on a pull request / merge request')
    .action(wrapActionHandlerWithSentry(getCiCommentAction(config)));
};

type CiCommentActionOptions = {};

const getCiCommentAction =
  (config: OpticCliConfig) => async (options: CiCommentActionOptions) => {};
