import fs from 'fs';
import { Command, Option } from 'commander';
import { UserError } from '@useoptic/openapi-utilities';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { NormalizedCiContext } from '@useoptic/openapi-utilities';
import {
  DEFAULT_CONTEXT_PATH,
  SUPPORTED_GITHUB_CI_PROVIDERS,
} from '../constants';
import { getContextFromCircleCiEnvironment } from './context-readers/github/circle-ci';
import { getContextFromGithubEnvironment } from './context-readers/github/github-actions';
import path from 'path';

export const registerCreateContext = (cli: Command, hideCommand: boolean) => {
  // TODO deprecate this
  cli
    .command(
      'create-context',
      hideCommand
        ? {
            hidden: true,
          }
        : {}
    )
    .addOption(
      new Option(
        '--provider <provider>',
        `the ci provider that this command should try extract the relevant values from. supported providers are: ${SUPPORTED_GITHUB_CI_PROVIDERS.join(
          ', '
        )}`
      ).choices([...SUPPORTED_GITHUB_CI_PROVIDERS])
    )
    .action(
      wrapActionHandlerWithSentry(
        async ({
          provider,
        }: {
          provider: (typeof SUPPORTED_GITHUB_CI_PROVIDERS)[number];
        }) => {
          console.warn(
            '[DEPRECATION WARNING] - This command will be deprecated in the future, please use `create-github-context` instead'
          );
          if (!provider) {
            throw new UserError({
              message: 'Cannot create context without a provider',
            });
          }
          if (!SUPPORTED_GITHUB_CI_PROVIDERS.includes(provider)) {
            throw new UserError({
              message: `Unexpected provider '${provider}', supported ci providers are: ${SUPPORTED_GITHUB_CI_PROVIDERS.join(
                ', '
              )}`,
            });
          }
          await createContext(provider);
        }
      )
    );
};

export const registerCreateGithubContext = (
  cli: Command,
  hideCommand: boolean = false
) => {
  cli
    .command(
      'create-github-context',
      hideCommand
        ? {
            hidden: true,
          }
        : {}
    )
    .addHelpText(
      'before',
      'Creates a context object used for uploading specs to Optic cloud. This is intended to be used with github.'
    )
    .addOption(
      new Option(
        '--provider <provider>',
        `the ci provider that this command should try extract the relevant values from. supported providers are: ${SUPPORTED_GITHUB_CI_PROVIDERS.join(
          ', '
        )}`
      ).choices([...SUPPORTED_GITHUB_CI_PROVIDERS])
    )
    .action(
      wrapActionHandlerWithSentry(
        async ({
          provider,
        }: {
          provider: (typeof SUPPORTED_GITHUB_CI_PROVIDERS)[number];
        }) => {
          if (!provider) {
            throw new UserError({
              message: 'Cannot create context without a provider',
            });
          }
          if (!SUPPORTED_GITHUB_CI_PROVIDERS.includes(provider)) {
            throw new UserError({
              message: `Unexpected provider '${provider}', supported ci providers are: ${SUPPORTED_GITHUB_CI_PROVIDERS.join(
                ', '
              )}`,
            });
          }
          await createContext(provider);
        }
      )
    );
};

const createContext = async (
  provider: (typeof SUPPORTED_GITHUB_CI_PROVIDERS)[number]
) => {
  let normalizedContext: NormalizedCiContext;
  if (provider === 'github') {
    normalizedContext = await getContextFromGithubEnvironment();
  } else if (provider === 'circleci') {
    normalizedContext = getContextFromCircleCiEnvironment();
  } else {
    return console.error('Unexpected provider, ', provider);
  }

  const contextFilePath = path.join(process.cwd(), DEFAULT_CONTEXT_PATH);
  if (fs.existsSync(contextFilePath)) {
    console.error(`Context file already exists at ${contextFilePath}`);
    throw new UserError();
  } else {
    fs.writeFileSync(
      contextFilePath,
      Buffer.from(JSON.stringify(normalizedContext))
    );
    console.log(`Context file written to ${contextFilePath}`);
  }
};
