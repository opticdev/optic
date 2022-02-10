import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';
import { NameMustBe, NameRule } from './helpers/config';
import { RuleApplies, ruleAppliesToLifeCycleKeyword } from '../shared-config';
import { isCase } from './helpers/is-case';
import { expect } from 'chai';

export default check<NameRule>('request body property naming')
  .implementation(({ request }, config) => {
    const applies = config?.applies || RuleApplies.always;
    const casing = config?.rule || NameMustBe.none;

    const { expect } = require('chai');
    request.bodyProperties[ruleAppliesToLifeCycleKeyword(applies)].must(
      `have ${casing.toString()} name`,
      (current) => {
        if (!isCase(current.key, casing))
          expect.fail(`${current.key} is not ${casing.toString()}`);
      }
    );
  })
  .failingExample(
    scenario(
      'adding a camelCase when pascalCase is required'
    ).requestBodySchema.added({
      type: 'object',
      properties: {
        examplePropertyName: { type: 'string' },
      },
      required: [],
    }),
    { rule: NameMustBe.pascalCase, applies: RuleApplies.always }
  )
  .passingExample(
    scenario(
      'adding a camelCase when camelCase is required'
    ).requestBodySchema.added({
      type: 'object',
      properties: {
        camelCase: { type: 'string' },
      },
      required: [],
    }),
    { rule: NameMustBe.camelCase, applies: RuleApplies.always }
  )
  .passingExample(
    scenario('wrong case ok if it is already there').requestBodySchema.changed(
      {
        type: 'object',
        properties: {
          examplePropertyName: { type: 'string' },
        },
        required: [],
      },
      (same) => same
    ),
    { rule: NameMustBe.pascalCase, applies: RuleApplies.whenAdded }
  );
