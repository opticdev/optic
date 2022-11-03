import { Matchers, Ruleset, SpecificationRule } from '../../../index';

export const MustHaveApiVersion = new SpecificationRule({
  name: 'Must have api version',
  rule: (specificationAssertions) => {
    specificationAssertions.requirement.matches({
      info: {
        version: Matchers.string,
      },
    });
  },
});

const FakeRuleset = {
  name: 'Fake Ruleset',
  description: 'A fake ruleset for testing',
  configSchema: {
    type: 'object',
    properties: {
      required_on: {
        type: 'string',
        enum: ['always', 'added'],
      },
    },
  },
  rulesetConstructor: (config: unknown) => {
    return new Ruleset({ name: 'fake-ruleset', rules: [MustHaveApiVersion] });
  },
};

export default FakeRuleset;
