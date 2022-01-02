import { NameRule } from './config';
import { ApiChangeDsl } from '../../sdk/api-change-dsl';
import { RuleApplies, ruleAppliesToLifeCycleKeyword } from '../shared-config';
import { isCase } from './is-case';
import { expect } from 'chai';

export function requestHeaderRules(rule: NameRule) {
  const applies = rule.applies || RuleApplies.always;
  return {
    headerNamingRule: ({ request }: ApiChangeDsl) => {
      request.headerParameter[ruleAppliesToLifeCycleKeyword(applies)].must(
        `have ${rule.rule.toString()} name`,
        (current) => {
          if (!isCase(current.name, rule.rule))
            expect.fail(`${current.name} is not ${rule.rule.toString()}`);
        }
      );
    },
  };
}

export function responseHeaderRules(rule: NameRule) {
  const applies = rule.applies || RuleApplies.always;
  return {
    headerNamingRule: ({ responses }: ApiChangeDsl) => {
      responses.header[ruleAppliesToLifeCycleKeyword(applies)].must(
        `have ${rule.rule.toString()} name`,
        (current) => {
          if (!isCase(current.name, rule.rule))
            expect.fail(`${current.name} is not ${rule.rule.toString()}`);
        }
      );
    },
  };
}

export function queryParameterRules(rule: NameRule) {
  const applies = rule.applies || RuleApplies.always;
  return {
    queryNamingRule: ({ request }: ApiChangeDsl) => {
      request.queryParameter[ruleAppliesToLifeCycleKeyword(applies)].must(
        `have ${rule.rule.toString()} name`,
        (current) => {
          if (!isCase(current.name, rule.rule))
            expect.fail(`${current.name} is not ${rule.rule.toString()}`);
        }
      );
    },
  };
}

export function requestPropertiesRule(rule: NameRule) {
  const applies = rule.applies || RuleApplies.always;
  return {
    requestPropertiesNamingRule: ({ request }: ApiChangeDsl) => {
      request.bodyProperties[ruleAppliesToLifeCycleKeyword(applies)].must(
        `have ${rule.rule.toString()} name`,
        (current) => {
          if (!isCase(current.key, rule.rule))
            expect.fail(`${current.key} is not ${rule.rule.toString()}`);
        }
      );
    },
  };
}

export function responsePropertiesRule(rule: NameRule) {
  const applies = rule.applies || RuleApplies.always;
  return {
    requestPropertiesNamingRule: ({ responses }: ApiChangeDsl) => {
      responses.bodyProperties[ruleAppliesToLifeCycleKeyword(applies)].must(
        `have ${rule.rule.toString()} name`,
        (current) => {
          if (!isCase(current.key, rule.rule))
            expect.fail(`${current.key} is not ${rule.rule.toString()}`);
        }
      );
    },
  };
}
