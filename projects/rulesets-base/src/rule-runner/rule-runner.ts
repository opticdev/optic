import { IFact, IChange, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import { groupFacts } from './group-facts';
import { runSpecificationRules } from './specification';
import { runOperationRules } from './operation';
import { runRequestRules } from './request';
import { runResponseBodyRules } from './response-body';
import { runResponseRules } from './response';
import { Rule } from '../types';

export class RuleRunner {
  constructor(private rules: Rule[]) {}

  runRulesWithFacts({
    context,
    currentFacts,
    nextFacts,
    changelog,
    currentJsonLike: beforeApiSpec,
    nextJsonLike: afterApiSpec,
  }: {
    context: any;
    nextFacts: IFact[];
    currentFacts: IFact[];
    changelog: IChange[];
    nextJsonLike: OpenAPIV3.Document;
    currentJsonLike: OpenAPIV3.Document;
  }): Result[] {
    const groupedFacts = groupFacts({
      beforeFacts: currentFacts,
      afterFacts: nextFacts,
      changes: changelog,
    });

    const specificationResults = runSpecificationRules({
      specification: groupedFacts.specification,
      rules: this.rules,
      customRuleContext: context,
      beforeApiSpec,
      afterApiSpec,
    });

    const endpointResults: Result[] = [];

    for (const endpoint of groupedFacts.endpoints.values()) {
      const operationResults = runOperationRules({
        operation: endpoint,
        rules: this.rules,
        customRuleContext: context,
        beforeApiSpec,
        afterApiSpec,
      });
      endpointResults.push(...operationResults);

      const requestRules = runRequestRules({
        operation: endpoint,
        request: endpoint.request,
        rules: this.rules,
        customRuleContext: context,
        beforeApiSpec,
        afterApiSpec,
      });
      endpointResults.push(...requestRules);

      for (const response of endpoint.responses.values()) {
        const responseRules = runResponseRules({
          operation: endpoint,
          response: response,
          rules: this.rules,
          customRuleContext: context,
          beforeApiSpec,
          afterApiSpec,
        });

        const responseBodyRules = runResponseBodyRules({
          operation: endpoint,
          response: response,
          rules: this.rules,
          customRuleContext: context,
          beforeApiSpec,
          afterApiSpec,
        });
        endpointResults.push(...responseBodyRules, ...responseRules);
      }
    }

    return [...specificationResults, ...endpointResults];
  }
}
