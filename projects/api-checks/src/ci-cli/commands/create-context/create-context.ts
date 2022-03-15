import fs from 'fs';
import { Command, Option } from 'commander';
import { UserError } from '../../errors';
import { wrapActionHandlerWithSentry } from '../../sentry';
import { CliConfig, NormalizedCiContext } from '../../types';
import { DEFAULT_CONTEXT_PATH, SUPPORTED_CI_PROVIDERS } from '../constants';
import { getContextFromCircleCiEnvironment } from './context-readers/circle-ci';
import { getContextFromGithubEnvironment } from './context-readers/github-actions';
import path from 'path';

export const registerCreateContext = (cli: Command) => {
  cli
    .command('create-context')
    .addOption(
      new Option(
        '--provider <provider>',
        `the ci provider that this command should try extract the relevant values from. supported providers are: ${SUPPORTED_CI_PROVIDERS.join(
          ', '
        )}`
      ).choices([...SUPPORTED_CI_PROVIDERS])
    )
    .action(
      wrapActionHandlerWithSentry(
        async ({
          provider,
        }: {
          provider: typeof SUPPORTED_CI_PROVIDERS[number];
        }) => {
          if (!provider) {
            throw new UserError('Cannot create context without a provider');
          }
          if (!SUPPORTED_CI_PROVIDERS.includes(provider)) {
            throw new UserError(
              `Unexpected provider '${provider}', supported ci providers are: ${SUPPORTED_CI_PROVIDERS.join(
                ', '
              )}`
            );
          }
          createContext(provider);
        }
      )
    );
};

const createContext = (provider: NonNullable<CliConfig['ciProvider']>) => {
  let normalizedContext: NormalizedCiContext;
  if (provider === 'github') {
    normalizedContext = getContextFromGithubEnvironment();
  } else if (provider === 'circleci') {
    normalizedContext = getContextFromCircleCiEnvironment();
  } else {
    return console.error('Unexpected provider, ', provider);
  }

  const contextFilePath = path.join(process.cwd(), DEFAULT_CONTEXT_PATH);
  if (fs.existsSync(contextFilePath)) {
    console.log(`Context file already exists at ${contextFilePath}`);
  } else {
    fs.writeFileSync(
      contextFilePath,
      Buffer.from(JSON.stringify(normalizedContext))
    );
    console.log(`Context file written to ${contextFilePath}`);
  }
};
