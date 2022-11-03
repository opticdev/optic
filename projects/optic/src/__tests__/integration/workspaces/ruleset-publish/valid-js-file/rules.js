module.exports = {
  name: 'the-best-ruleset',
  description: 'hello',
  configSchema: {
    type: 'object',
    properties: {
      validate_all: {
        type: 'boolean',
      },
    },
  },
  rulesetConstructor: () => {
    return {};
  },
};
