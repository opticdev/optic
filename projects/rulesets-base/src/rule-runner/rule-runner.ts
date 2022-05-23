import { IFact, IChange, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import { groupFacts } from './group-facts';
import { runSpecificationRules } from './specification';
import { runOperationRules } from './operation';
import { runRequestRules } from './request';
import { runResponseBodyRules } from './response-body';
import { runResponseRules } from './response';
import { Rule, Ruleset } from '../rules';

export class RuleRunner {
  constructor(private rules: (Ruleset | Rule)[]) {}

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
    // Groups the flat list of beforefacts, afterfacts and changes by location (e.g. operation, query parameter, response, response property, etc).
    // A node can contain a before fact, after fact and or change.
    const openApiFactNodes = groupFacts({
      beforeFacts: currentFacts,
      afterFacts: nextFacts,
      changes: changelog,
    });

    // Run rules on specifications and collect the results
    const specificationResults = runSpecificationRules({
      specificationNode: openApiFactNodes.specification,
      rules: this.rules,
      customRuleContext: context,
      beforeApiSpec,
      afterApiSpec,
    });

    const endpointResults: Result[] = [];

    // For each endpoint from the endpoint fact nodes (this will include endpoints in both before and after specs) run rules and collect the results
    for (const endpointNode of openApiFactNodes.endpoints.values()) {
      const operationResults = runOperationRules({
        specificationNode: openApiFactNodes.specification,
        operationNode: endpointNode,
        rules: this.rules,
        customRuleContext: context,
        beforeApiSpec,
        afterApiSpec,
      });
      endpointResults.push(...operationResults);

      const requestRules = runRequestRules({
        specificationNode: openApiFactNodes.specification,
        operationNode: endpointNode,
        requestNode: endpointNode.request,
        rules: this.rules,
        customRuleContext: context,
        beforeApiSpec,
        afterApiSpec,
      });
      endpointResults.push(...requestRules);

      for (const responseNode of endpointNode.responses.values()) {
        const responseRules = runResponseRules({
          specificationNode: openApiFactNodes.specification,
          operationNode: endpointNode,
          responseNode: responseNode,
          rules: this.rules,
          customRuleContext: context,
          beforeApiSpec,
          afterApiSpec,
        });

        const responseBodyRules = runResponseBodyRules({
          specificationNode: openApiFactNodes.specification,
          operationNode: endpointNode,
          responseNode: responseNode,
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
