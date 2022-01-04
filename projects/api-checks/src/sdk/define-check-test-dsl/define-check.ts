import { BeforeAndAfter } from './scenarios';
import { ApiCheckService } from '../api-check-service';
import { ApiChangeDsl } from '../api-change-dsl';
import { Result } from '../types';

export interface IApiCheckDefinition {
  name: string;
  implementation?: (apiChangeDsl: ApiChangeDsl) => void;
  description?: string;
  validExamples: BeforeAndAfter[];
  invalidExamples: BeforeAndAfter[];
}

class ApiCheckImpl {
  public check: IApiCheckDefinition;

  constructor(name: string) {
    this.check = {
      name,
      validExamples: [],
      invalidExamples: [],
    };
  }

  description(description: string) {
    this.check.description = description;
    return this;
  }

  implementation(
    implementation: (apiChangeDsl: ApiChangeDsl) => void | Promise<void>
  ) {
    this.check.implementation = implementation;
    return this;
  }

  passingExample(beforeAndAfter: BeforeAndAfter) {
    this.check.validExamples = [...this.check.validExamples, beforeAndAfter];
    return this;
  }

  failingExample(beforeAndAfter: BeforeAndAfter) {
    this.check.invalidExamples = [
      ...this.check.invalidExamples,
      beforeAndAfter,
    ];
    return this;
  }

  async testExamples() {
    if (!this.check.implementation)
      throw new Error('no implementation for rule ' + this.check.name);
    const service = new ApiCheckService().useRulesBuildFrom(
      this.check.implementation
    );

    const results: {
      passing: { passed: boolean; results: Result[] }[];
      failing: { passed: boolean; results: Result[] }[];
    } = {
      passing: await Promise.all(
        this.check.validExamples.map(async ([before, after]) => {
          const runResults = await service.runRules(before, after, {});

          return {
            passed: !runResults.some((i) => !i.passed),
            results: runResults,
          };
        })
      ),
      failing: await Promise.all(
        this.check.invalidExamples.map(async ([before, after]) => {
          const runResults = await service.runRules(before, after, {});
          return {
            passed: !runResults.some((i) => !i.passed),
            results: runResults,
          };
        })
      ),
    };
    return results;
  }
}

export function check(name: string) {
  return new ApiCheckImpl(name);
}
