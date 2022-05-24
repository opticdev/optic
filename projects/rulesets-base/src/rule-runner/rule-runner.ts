import {
  IFact,
  IChange,
  OpenAPIV3,
  Result,
  OperationLocation,
  ILocation,
  OpenApiKind,
} from '@useoptic/openapi-utilities';
import {
  ISpectralDiagnostic,
  Spectral,
  RulesetDefinition as SpectralRulesetDefinition,
} from '@stoplight/spectral-core';
import { oas } from '@stoplight/spectral-rulesets';

import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import isEqual from 'lodash.isequal';

import { groupFacts } from './group-facts';
import { runSpecificationRules } from './specification';
import { runOperationRules } from './operation';
import { runRequestRules } from './request';
import { runResponseBodyRules } from './response-body';
import { runResponseRules } from './response';
import { Rule, Ruleset } from '../rules';

type SpectralRules = Extract<
  SpectralRulesetDefinition,
  { extends: any; rules: any }
>['rules'];

export class RuleRunner {
  constructor(private rules: (Ruleset | Rule)[]) {}

  async runSpectralRules({
    ruleset,
    nextFacts,
    nextJsonLike,
  }: {
    ruleset: SpectralRules;
    nextFacts: IFact[];
    nextJsonLike: OpenAPIV3.Document;
  }): Promise<Result[]> {
    const spectral = new Spectral();
    spectral.setRuleset({
      extends: [[oas as SpectralRulesetDefinition, 'all']],
      rules: ruleset,
    });
    const operations = nextFacts.filter(
      (i) => i.location.kind === OpenApiKind.Operation
    );

    const results: ISpectralDiagnostic[] = await spectral.run(
      nextJsonLike as any
    );
    const opticResult: Result[] = results.map((spectralResult) => {
      const operationPath = spectralResult.path.slice(0, 3);
      const matchingOperation = operations.find((i) =>
        isEqual(i.location.conceptualPath, operationPath)
      );

      const location: ILocation = {
        conceptualLocation: (matchingOperation
          ? matchingOperation.location.conceptualLocation
          : { path: 'This Specification', method: '' }) as OperationLocation,
        jsonPath: jsonPointerHelpers.compile(
          spectralResult.path.map((i) => i.toString())
        ),
        conceptualPath: [],
        kind: 'API' as any,
      } as any;

      return {
        condition: spectralResult.code.toString(),
        passed: false,
        error: spectralResult.message,
        isMust: true,
        isShould: false,
        where: 'requirement ',
        change: {
          location,
        } as any,
      };
    });

    return opticResult;
  }

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
