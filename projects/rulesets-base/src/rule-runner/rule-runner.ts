import {
  IFact,
  IChange,
  OpenAPIV3,
  Result,
  OperationLocation,
  ILocation,
  OpenApiKind,
  ObjectDiff,
  RuleResult,
  traverseSpec,
  factsToChangelog,
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
import { ExternalRule, Rule, Ruleset } from '../rules';
import { ExternalRuleBase } from '../rules/external-rule-base';

type SpectralRules = Extract<
  SpectralRulesetDefinition,
  { extends: any; rules: any }
>['rules'];

function resultToRuleResult(r: Result): RuleResult {
  return {
    where: r.where,
    error: r.error,
    passed: r.passed,
    exempted: r.exempted,
    location: {
      jsonPath: r.change.location.jsonPath,
      spec:
        'removed' in r.change && !!r.change.removed?.before
          ? 'before'
          : 'after',
    },
    name: r.name ?? 'Rule',
    type: r.type,
    docsLink: r.docsLink,
    expected: r.expected,
    received: r.received,
  };
}

export class RuleRunner {
  constructor(private rules: (Ruleset | Rule | ExternalRule)[]) {}

  // TODO deprecate this once spectral rules are natively supported
  async runSpectralRules({
    ruleset,
    nextFacts,
    nextJsonLike,
  }: {
    ruleset: SpectralRules;
    nextFacts: IFact[];
    nextJsonLike: OpenAPIV3.Document;
  }): Promise<Result[]> {
    if ((nextJsonLike as any)['x-optic-ci-empty-spec'] === true) {
      return [];
    }
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

  // TODO deprecate
  async runRulesWithFacts(inputs: {
    context: any;
    nextFacts: IFact[];
    currentFacts: IFact[];
    changelog: IChange[];
    nextJsonLike: OpenAPIV3.Document;
    currentJsonLike: OpenAPIV3.Document;
  }): Promise<Result[]> {
    const {
      context,
      currentFacts,
      nextFacts,
      changelog,
      currentJsonLike: beforeApiSpec,
      nextJsonLike: afterApiSpec,
    } = inputs;
    const externalRules = this.rules.filter((rule) =>
      ExternalRuleBase.isInstance(rule)
    ) as ExternalRule[];
    const rulesOrRulesets = this.rules.filter(
      (rule) => !ExternalRuleBase.isInstance(rule)
    ) as (Ruleset | Rule)[];

    const externalResults: Result[] = [];
    for (const externalRule of externalRules) {
      const results = await externalRule.runRules(inputs);
      externalResults.push(...results);
    }

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
      rules: rulesOrRulesets,
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
        rules: rulesOrRulesets,
        customRuleContext: context,
        beforeApiSpec,
        afterApiSpec,
      });
      endpointResults.push(...operationResults);

      const requestRules = runRequestRules({
        specificationNode: openApiFactNodes.specification,
        operationNode: endpointNode,
        requestNode: endpointNode.request,
        rules: rulesOrRulesets,
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
          rules: rulesOrRulesets,
          customRuleContext: context,
          beforeApiSpec,
          afterApiSpec,
        });

        const responseBodyRules = runResponseBodyRules({
          specificationNode: openApiFactNodes.specification,
          operationNode: endpointNode,
          responseNode: responseNode,
          rules: rulesOrRulesets,
          customRuleContext: context,
          beforeApiSpec,
          afterApiSpec,
        });
        endpointResults.push(...responseBodyRules, ...responseRules);
      }
    }

    return [...externalResults, ...specificationResults, ...endpointResults];
  }

  async runRules(inputs: {
    context: any;
    diffs: ObjectDiff[];
    fromSpec: OpenAPIV3.Document;
    toSpec: OpenAPIV3.Document;
  }): Promise<RuleResult[]> {
    const { context, fromSpec: beforeApiSpec, toSpec: afterApiSpec } = inputs;
    const externalRules = this.rules.filter((rule) =>
      ExternalRuleBase.isInstance(rule)
    ) as ExternalRule[];
    const rulesOrRulesets = this.rules.filter(
      (rule) => !ExternalRuleBase.isInstance(rule)
    ) as (Ruleset | Rule)[];

    const externalResults: RuleResult[] = [];
    for (const externalRule of externalRules) {
      const results = await externalRule.runRulesV2(inputs);
      externalResults.push(...results);
    }

    // TODO reimplement the rule runner so we don't need to generate legacy fact types here
    const beforeFacts =
      inputs.fromSpec['x-optic-ci-empty-spec'] === true
        ? []
        : traverseSpec(inputs.fromSpec);
    const afterFacts =
      inputs.toSpec['x-optic-ci-empty-spec'] === true
        ? []
        : traverseSpec(inputs.toSpec);
    const changelog = factsToChangelog(beforeFacts, afterFacts);

    const openApiFactNodes = groupFacts({
      beforeFacts,
      afterFacts,
      changes: changelog,
    });

    // Run rules on specifications and collect the results
    const specificationResults: RuleResult[] = runSpecificationRules({
      specificationNode: openApiFactNodes.specification,
      rules: rulesOrRulesets,
      customRuleContext: context,
      beforeApiSpec,
      afterApiSpec,
    }).map(resultToRuleResult);

    const endpointResults: RuleResult[] = [];

    // For each endpoint from the endpoint fact nodes (this will include endpoints in both before and after specs) run rules and collect the results
    for (const endpointNode of openApiFactNodes.endpoints.values()) {
      const operationResults = runOperationRules({
        specificationNode: openApiFactNodes.specification,
        operationNode: endpointNode,
        rules: rulesOrRulesets,
        customRuleContext: context,
        beforeApiSpec,
        afterApiSpec,
      });
      endpointResults.push(...operationResults.map(resultToRuleResult));

      const requestRules = runRequestRules({
        specificationNode: openApiFactNodes.specification,
        operationNode: endpointNode,
        requestNode: endpointNode.request,
        rules: rulesOrRulesets,
        customRuleContext: context,
        beforeApiSpec,
        afterApiSpec,
      });
      endpointResults.push(...requestRules.map(resultToRuleResult));

      for (const responseNode of endpointNode.responses.values()) {
        const responseRules = runResponseRules({
          specificationNode: openApiFactNodes.specification,
          operationNode: endpointNode,
          responseNode: responseNode,
          rules: rulesOrRulesets,
          customRuleContext: context,
          beforeApiSpec,
          afterApiSpec,
        });

        const responseBodyRules = runResponseBodyRules({
          specificationNode: openApiFactNodes.specification,
          operationNode: endpointNode,
          responseNode: responseNode,
          rules: rulesOrRulesets,
          customRuleContext: context,
          beforeApiSpec,
          afterApiSpec,
        });
        endpointResults.push(
          ...responseBodyRules.map(resultToRuleResult),
          ...responseRules.map(resultToRuleResult)
        );
      }
    }

    return [...externalResults, ...specificationResults, ...endpointResults];
  }
}
