import { check } from '../../sdk/define-check-test-dsl/define-check';
import { scenario } from '../../sdk/define-check-test-dsl/scenarios';
import { NameMustBe, NameRule } from './helpers/config';
import { RuleApplies, ruleAppliesToLifeCycleKeyword } from '../shared-config';
import { isCase } from './helpers/is-case';
import { expect } from 'chai';

export default check<NameRule>('request header naming')
  .implementation(({ request }, config) => {
    const applies = config?.applies || RuleApplies.always;
    const casing = config?.rule || NameMustBe.none;

    const { expect } = require('chai');
    request.headerParameter[ruleAppliesToLifeCycleKeyword(applies)].must(
      `have ${casing.toString()} name`,
      (current) => {
        if (!isCase(current.name, casing))
          expect.fail(`${current.name} is not ${casing.toString()}`);
      }
    );
  })
  .failingExample(
    scenario(
      'adding a camelCase when pascalCase is required'
    ).requestParameter.added({
      in: 'header',
      name: 'exampleParam',
      required: false,
    }),
    { rule: NameMustBe.pascalCase, applies: RuleApplies.always }
  )
  .failingExample(
    scenario(
      'adding a camelCase when Header-Param-Case is required'
    ).requestParameter.added({
        in: 'header',
        name: 'exampleParam',
        required: false,
    }),
      { rule: NameMustBe.headerParamCase, applies: RuleApplies.always }
  )
  .passingExample(
    scenario(
      'adding a camelCase when camelCase is required'
    ).requestParameter.added({
      in: 'header',
      name: 'exampleParam',
      required: false,
    }),
    { rule: NameMustBe.camelCase, applies: RuleApplies.always }
  )
  .passingExample(
    scenario('wrong case ok if it is already there').requestParameter.changed(
      {
        in: 'header',
        name: 'exampleParam',
        required: false,
      },
      (same) => same
    ),
    { rule: NameMustBe.pascalCase, applies: RuleApplies.whenAdded }
  )
  .passingExample(
    scenario(
      'adding a Header-Param-Case when Header-Param-Case is required'
    ).requestParameter.added({
      in: 'header',
      name: 'Example-Header',
      required: false,
    }),
    { rule: NameMustBe.headerParamCase, applies: RuleApplies.always }
  )
  .passingExample(
    scenario('wrong case ok if it is already there').requestParameter.changed(
      {
        in: 'header',
        name: 'exampleParam',
        required: false,
      },
      (same) => same
    ),
    { rule: NameMustBe.headerParamCase, applies: RuleApplies.whenAdded }
  );

