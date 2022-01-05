import { BeforeAndAfter } from './scenarios';
import { ApiCheckService } from '../api-check-service';
import { ApiChangeDsl } from '../api-change-dsl';
import { Result } from '../types';
import invariant from 'ts-invariant';

export interface IApiCheckDefinition<CheckConfig> {
  name: string;
  implementation?: (apiChangeDsl: ApiChangeDsl, config: CheckConfig) => void;
  description?: string;
  validExamples: BeforeAndAfter[];
  invalidExamples: BeforeAndAfter[];
}

class ApiCheckImpl<CheckConfig> {
  public check: IApiCheckDefinition<CheckConfig>;

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
    implementation: (
      apiChangeDsl: ApiChangeDsl,
      config?: CheckConfig
    ) => void | Promise<void>
  ) {
    this.check.implementation = implementation;
    return this;
  }

  passingExample(beforeAndAfter: BeforeAndAfter, config?: CheckConfig) {
    this.check.validExamples = [...this.check.validExamples, beforeAndAfter];

    if (!this.check.implementation) test.skip('', () => 1);

    if (typeof jest !== 'undefined' && this.check.implementation) {
      // @ts-ignore
      const { test, expect } = global;

      const testName = `passing case ${this.check.validExamples.length}: ${beforeAndAfter[2]}`;

      test(testName, async () => {
        const testResult = await this.testExample(beforeAndAfter, config);
        expect(testResult).toMatchSnapshot();
        expect(testResult.passed).toBeTruthy();
      });
    }

    return this;
  }

  failingExample(beforeAndAfter: BeforeAndAfter, config?: CheckConfig) {
    this.check.invalidExamples = [
      ...this.check.invalidExamples,
      beforeAndAfter,
    ];

    if (!this.check.implementation) test.skip('', () => 1);

    if (typeof jest !== 'undefined' && this.check.implementation) {
      // @ts-ignore
      const { it, expect } = global;

      const testName = `failing case ${this.check.invalidExamples.length}: ${beforeAndAfter[2]}`;
      it(testName, async () => {
        const testResult = await this.testExample(beforeAndAfter, config);
        expect(testResult).toMatchSnapshot();
        expect(testResult.passed).toBeFalsy();
      });
    }

    return this;
  }

  private async testExample(
    beforeAndAfter: BeforeAndAfter,
    config?: CheckConfig
  ) {
    invariant(this.check.implementation);
    const service = new ApiCheckService().useRulesBuildFrom((dsl) =>
      this.check.implementation!(dsl, config as any)
    );

    const [before, after] = beforeAndAfter;

    const runResults = await service.runRules(before, after, {});

    return {
      passed: !runResults.some((i) => !i.passed),
      results: runResults,
    };
  }
}

export function check<CheckConfig = undefined>(name: string) {
  return new ApiCheckImpl<CheckConfig>(name);
}
