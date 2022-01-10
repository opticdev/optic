import { OpenAPIV3 } from 'openapi-types';
import flatten from 'lodash.flatten';
import {
  ApiCheckDsl,
  Result,
  factsToChangelog,
  OpenAPITraverser,
  IChange,
  IFact,
  OpenApiFact,
} from '@useoptic/openapi-utilities';
import { SpectralDsl } from './spectral/dsl';
import { ApiChangeDsl, ApiCheckDslContext } from './api-change-dsl';

export type DslConstructorInput<Context> = {
  context: Context;
  nextFacts: IFact<OpenApiFact>[];
  currentFacts: IFact<OpenApiFact>[];
  changelog: IChange<OpenApiFact>[];
  nextJsonLike: OpenAPIV3.Document;
  currentJsonLike: OpenAPIV3.Document;
};

export class ApiCheckService<Context> {
  constructor(private getExecutionDate?: (context: Context) => Date) {}

  private rules: ((
    input: DslConstructorInput<Context>
  ) => Promise<Result>[])[] = [];
  private additionalResults: ((
    input: DslConstructorInput<Context>
  ) => Promise<Result[]>)[] = [];

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

  // tried using "Ruleset" but getting typeerrors -- falling back to any
  // @Stephen please chech on this
  useSpectralRuleset(ruleset: any) {
    const runner = async (input: DslConstructorInput<Context>) => {
      const dsl = new SpectralDsl(input.nextJsonLike, input.nextFacts, ruleset);
      return await dsl.spectralChecksResults;
    };
    this.additionalResults.push(runner);
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

  async runRules(
    currentJsonLike: OpenAPIV3.Document,
    nextJsonLike: OpenAPIV3.Document,
    context: Context
  ) {
    const currentTraverser = new OpenAPITraverser();
    const nextTraverser = new OpenAPITraverser();

    await currentTraverser.traverse(currentJsonLike);
    const currentFacts = currentTraverser.accumulator.allFacts();
    await nextTraverser.traverse(nextJsonLike);
    const nextFacts = nextTraverser.accumulator.allFacts();

    const input: DslConstructorInput<Context> = {
      currentFacts,
      nextJsonLike: nextJsonLike,
      currentJsonLike: currentJsonLike,
      nextFacts,
      changelog: factsToChangelog(currentFacts, nextFacts),
      context,
    };

    const checkPromises: Promise<Result>[] = flatten(
      this.rules.map((ruleRunner) => ruleRunner(input))
    );

    const additionalCheckPromises = this.additionalResults.map((ruleRunner) =>
      ruleRunner(input)
    );

    const results: Result[] = await Promise.all(checkPromises);

    const additionalCheckResults: Result[] = flatten(
      await Promise.all(additionalCheckPromises)
    );

    const date = this.getExecutionDate && this.getExecutionDate(context);

    const combinedResults = [...results, ...additionalCheckResults].filter(
      (result) => {
        // filter when effective date is set and context is mapped to a date of execution
        if (result.effectiveOnDate && date) {
          // execution is after effective date, include
          // execution is before effective date filter out
          return date > result.effectiveOnDate;
        }

        return true;
      }
    );

    return combinedResults;
  }
}
