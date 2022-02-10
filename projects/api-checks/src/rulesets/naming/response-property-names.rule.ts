import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';
import { NameMustBe, NameRule } from './helpers/config';
import { RuleApplies, ruleAppliesToLifeCycleKeyword } from '../shared-config';
import { isCase } from './helpers/is-case';
import { expect } from 'chai';

export default check<NameRule>('response body property naming')
  .implementation(({ responses }, config) => {
    const applies = config?.applies || RuleApplies.always;
    const casing = config?.rule || NameMustBe.none;

    const { expect } = require('chai');
    responses.bodyProperties[ruleAppliesToLifeCycleKeyword(applies)].must(
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
    ).responseBodySchema.added({
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
    ).responseBodySchema.added({
      type: 'object',
      properties: {
        camelCase: { type: 'string' },
      },
      required: [],
    }),
    { rule: NameMustBe.camelCase, applies: RuleApplies.always }
  )
  .passingExample(
    scenario('wrong case ok if it is already there').responseBodySchema.changed(
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
