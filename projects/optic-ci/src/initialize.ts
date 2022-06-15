import { _makeCiCliInternal } from './cli/make-cli';
import { OpticConfiguration } from './config';
import { initializeRuleRunner } from './rule-runner';

export const initializeCli = (config: OpticConfiguration) => {
  return _makeCiCliInternal(
    initializeRuleRunner(config.rules || []),
    {
      opticToken: config.token,
      gitProvider: config.gitProvider,
      ciProvider: 'github',
    },
    true,
    config.generateContext,
    config.spectralConfig
  );
};
