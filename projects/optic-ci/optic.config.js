// This is a sample optic.config.js used to run locally
const dotenv = require('dotenv');
const path = require('path');
const {
  BreakingChangesRuleset,
  NamingChangesRuleset,
} = require('@useoptic/standard-rulesets');

dotenv.config({
  path: path.join(__dirname, '.env'),
});

module.exports = {
  token: process.env.OPTIC_TOKEN,
  gitProvider: {
    token: process.env.GITHUB_TOKEN,
  },
  rules: [
    new BreakingChangesRuleset(),
    new NamingChangesRuleset({
      applies: 'always',
      options: {
        properties: 'camelCase',
        queryParameters: 'camelCase',
        requestHeaders: 'camelCase',
        responseHeaders: 'camelCase',
      },
    }),
  ],
};
