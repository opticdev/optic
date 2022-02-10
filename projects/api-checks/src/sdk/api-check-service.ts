import { OpenAPIV3 } from 'openapi-types';
import flatten from 'lodash.flatten';
import {
  ApiCheckDsl,
  Result,
  OpenAPITraverser,
  IChange,
  IFact,
  OpenApiFact,
} from '@useoptic/openapi-utilities';
import { SpectralDsl } from './spectral/dsl';
import { ApiChangeDsl, ApiCheckDslContext } from './api-change-dsl';
import { oas } from '@stoplight/spectral-rulesets';
import { RulesetDefinition } from '@stoplight/spectral-core';

export type DslConstructorInput<Context> = {
  context: Context;
  nextFacts: IFact<OpenApiFact>[];
  currentFacts: IFact<OpenApiFact>[];
  changelog: IChange<OpenApiFact>[];
  nextJsonLike: OpenAPIV3.Document;
  currentJsonLike: OpenAPIV3.Document;
};

type Rule<Context> = (
  input: DslConstructorInput<Context>
) => Promise<Result | Result[]>[];

type SpectralRules = Extract<
  RulesetDefinition,
  { extends: any; rules: any }
>['rules'];

export class ApiCheckService<Context> {
  constructor(private getExecutionDate?: (context: Context) => Date) {}

  public rules: Rule<Context>[] = [];

  mergeWith(apiCheckService: ApiCheckService<Context>) {
    this.rules.push(...apiCheckService.rules);
  }

  useRulesFrom(rules: (apiChangeDsl: ApiChangeDsl) => void) {
    const dslConstructor = (input: DslConstructorInput<ApiCheckDslContext>) => {
      return new ApiChangeDsl(
        input.nextFacts,
        input.changelog,
        input.currentJsonLike,
        input.nextJsonLike,
        input.context
      );
    };

    const runner = (input: DslConstructorInput<Context>) => {
      const dsl = dslConstructor(input);
      rules(dsl);
      return dsl.checkPromises();
    };

    this.rules.push(runner);
    return this;
  }

  useDsl<DSL extends ApiCheckDsl>(
    dslConstructor: (input: DslConstructorInput<Context>) => DSL,
    ...rules: ((dsl: DSL) => void)[]
  ) {
    const runner = (input: DslConstructorInput<Context>) => {
      const dsl = dslConstructor(input);
      rules.forEach((i) => i(dsl));
      return dsl.checkPromises();
    };

    this.rules.push(runner);
    return this;
  }
  // for our standard DSL
  useRules(rulesMap: { [key: string]: (dsl: ApiChangeDsl) => void }) {
    const dslConstructor = (input: DslConstructorInput<ApiCheckDslContext>) => {
      return new ApiChangeDsl(
        input.nextFacts,
        input.changelog,
        input.currentJsonLike,
        input.nextJsonLike,
        input.context
      );
    };

    const runner = (input: DslConstructorInput<Context>) => {
      const dsl = dslConstructor(input);
      const rules = Object.values(rulesMap);
      rules.forEach((i) => i(dsl));
      return dsl.checkPromises();
    };

    this.rules.push(runner);
    return this;
  }

  useSpectralRuleset(ruleset: RulesetDefinition) {
    const runner = (input: DslConstructorInput<Context>) => {
      const dsl = new SpectralDsl(input.nextJsonLike, input.nextFacts, ruleset);
      return [dsl.spectralChecksResults];
    };
    this.rules.push(runner);
    return this;
  }

  // Wrapper for useSpectralRuleset that includes the `oas` ruleset and allows for
  // extending them with `rules`. This removes the need for the user to pass in
  // an `oas`, which might be incompatible.
  useSpectralOasRuleset(rules: SpectralRules) {
    const runner = (input: DslConstructorInput<Context>) => {
      const dsl = new SpectralDsl(input.nextJsonLike, input.nextFacts, {
        extends: [[oas as RulesetDefinition, 'all']],
        rules,
      });
      return [dsl.spectralChecksResults];
    };
    this.rules.push(runner);
    return this;
  }

  useDslWithNamedRules<DSL extends ApiCheckDsl>(
    dslConstructor: (input: DslConstructorInput<Context>) => DSL,
    rulesMap: { [key: string]: (dsl: DSL) => void }
  ) {
    const runner = (input: DslConstructorInput<Context>) => {
      const dsl = dslConstructor(input);
      const rules = Object.values(rulesMap);
      rules.forEach((i) => i(dsl));
      return dsl.checkPromises();
    };

    this.rules.push(runner);
    return this;
  }

  generateFacts(
    currentJsonLike: OpenAPIV3.Document,
    nextJsonLike: OpenAPIV3.Document
  ) {
    const currentTraverser = new OpenAPITraverser();
    const nextTraverser = new OpenAPITraverser();

    currentTraverser.traverse(currentJsonLike);
    const currentFacts = [...currentTraverser.facts()];
    nextTraverser.traverse(nextJsonLike);
    const nextFacts = [...nextTraverser.facts()];

    return {
      currentFacts,
      nextFacts,
    };
  }

  async runRulesWithFacts(
    input: DslConstructorInput<Context>
  ): Promise<Result[]> {
    const checkPromises: Promise<Result | Result[]>[] = flatten(
      this.rules.map((ruleRunner) => ruleRunner(input))
    );

    const results: Result[] = (await Promise.all(checkPromises)).flat();

    // TODO deprecate this and run this separately as another config point
    const date = this.getExecutionDate && this.getExecutionDate(input.context);

    const filteredResults = results.filter((result) => {
      // filter when effective date is set and context is mapped to a date of execution
      if (result.effectiveOnDate && date) {
        // execution is after effective date, include
        // execution is before effective date filter out
        return date > result.effectiveOnDate;
      }

      return true;
    });

    return filteredResults;
  }
}
