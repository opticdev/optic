import { makeCiCli } from './cli/make-cli';
import { OpticConfiguration } from './config';
import { initializeRuleRunner } from './rule-runner';

export const initializeCli = (config: OpticConfiguration) => {
  return makeCiCli(
    initializeRuleRunner(config.rules || []),
    {
      opticToken: config.token,
      gitProvider: config.gitProvider,
      ciProvider: 'github',
    },
    config.generateContext,
    config.spectralConfig
  );
};
