import path from 'path';
import fs from 'fs';
import { Rule, Ruleset } from '@useoptic/rulesets-base';

import { OPTIC_CONFIG_PATH } from './constants';
import { CheckConfiguration } from './checker';
/**
 * Expected format
 * module.exports = {
 *  token: process.env.OPTIC_TOKEN,
 *  gitProvider: {
 *    token: process.env.GITHUB_TOKEN,
 *  },
 * rules: [],
 * generateContext: () => ({})
 */

type OpticConfiguration = {
  token?: string;
  gitProvider?: {
    token: string;
  };
  // TODO RA-V2 - remove checks
  checks?: CheckConfiguration[];
  rules?: (Ruleset | Rule)[];
  generateContext?: () => Object;
};

const findOpticConfigPath = (dir: string): string | null => {
  while (true) {
    const opticConfigPath = path.join(dir, OPTIC_CONFIG_PATH);

    if (fs.existsSync(opticConfigPath)) {
      return opticConfigPath;
    }

    const nextDir = path.dirname(dir);
    if (nextDir === dir) {
      break;
    }
    dir = nextDir;
  }

  return null;
};

export const readConfig = async (): Promise<OpticConfiguration> => {
  const opticConfigPath = findOpticConfigPath(process.cwd());
  if (opticConfigPath) {
    // TODO add validation to configuration loading
    // TODO add in fallbacks / defaults here
    return import(opticConfigPath);
  } else {
    return {};
  }
};
