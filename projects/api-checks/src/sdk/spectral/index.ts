import { SpectralDsl } from './dsl';
import { oas } from '@stoplight/spectral-rulesets';
import { RulesetDefinition } from '@stoplight/spectral-core';

const ruleset: RulesetDefinition = {
  extends: [[oas as RulesetDefinition, 'all']],
};

export const defaultEmptySpec: any = {
  openapi: '3.0.1',
  paths: {
    '/example': {
      get: {},
    },
  },
  info: { version: '0.0.0', title: 'Empty' },
};

const result = new SpectralDsl(defaultEmptySpec, [], ruleset);
result.run();
