import { createSelectJsonPathHelper } from '../select-when-rule';
import { OpenAPIV3, Result } from '@useoptic/openapi-utilities';

export const spec: OpenAPIV3.OperationObject = {
  summary: 'Hello',
  responses: {},
};

export const spec2: OpenAPIV3.OperationObject = {
  summary: 'Goodbye',
  responses: {},
};

describe('select when rules', () => {
  it('works for json paths', async () => {
    const checks: Promise<Result>[] = [];

    const { selectJsonPath } = createSelectJsonPathHelper(
      [
        {
          current: spec,
          next: spec2,
          conceptualLocation: {
            path: '/my-path',
            method: 'GET',
          },
        },
      ],
      (check) => checks.push(check)
    );
    selectJsonPath('summaries', '$..summary')
      .when((current, next) => {
        return true;
      })
      .must('be amazing', (current, next) => {
        if (current[0] !== next[0]) {
          throw new Error("can't change the summary!");
        }
      });

    const results = await Promise.all(checks);
    expect(results).toMatchSnapshot();
  });

  it('empty json paths will not break', async () => {
    const checks: Promise<Result>[] = [];

    const { selectJsonPath } = createSelectJsonPathHelper(
      [
        {
          current: spec,
          next: spec2,
          conceptualLocation: {
            path: '/my-path',
            method: 'GET',
          },
        },
      ],
      (check) => checks.push(check)
    );

    selectJsonPath('summaries', '$..summary')
      .when((current, next) => {
        return true;
      })
      .must('be amazing', (current, next) => {
        if (current[0] !== next[0]) {
          throw new Error("can't change the summary!");
        }
      });

    const results = await Promise.all(checks);
    expect(results).toMatchSnapshot();
  });

  it("will disqualify a rule so it doesn't even run", async () => {
    const checks: Promise<Result>[] = [];

    const { selectJsonPath } = createSelectJsonPathHelper(
      [
        {
          current: spec,
          next: spec2,
          conceptualLocation: {
            path: '/my-path',
            method: 'GET',
          },
        },
      ],
      (check) => checks.push(check)
    );

    selectJsonPath('summaries', '$..summary')
      .when((current, next) => {
        return false;
      })
      .must('be amazing', (current, next) => {
        console.log(current);
        console.log(next);
        if (current[0] !== next[0]) {
          throw new Error("can't change the summary!");
        }
      });

    const results = await Promise.all(checks);
    expect(results).toMatchSnapshot();
  });
});
