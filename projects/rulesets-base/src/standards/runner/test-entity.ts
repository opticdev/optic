import { AttributeAssertions } from '../attribute/assertions';
import { Result } from '@useoptic/openapi-utilities';

export function testEntityAttributes<T, Context, Standard>(
  parentFactBefore: T | undefined,
  parentFactAfter: T | undefined,
  entityStandard: Standard,
  parentLifecycle?: 'added' | 'removed' | 'changed'
) {
  const results: Result[] = [];

  const tester = {
    results: () => results,
    testAll: (attributesWithTests: (keyof Standard)[]) => {
      attributesWithTests.forEach((attribute) => {
        const assertions = entityStandard[attribute];
        tester.test(attribute as any, assertions as any);
      });
    },
    test: (key: keyof T, assertions?: AttributeAssertions<T, Context>) => {
      if (assertions) {
        if (parentLifecycle === 'added' && parentFactAfter) {
          const rules = getRequirements(assertions);
          results.push(
            ...rules.map((i) =>
              wrapTest(
                () => i.assertion((parentFactAfter as any)[key], {} as any),
                {
                  where: `${key} added: `,
                  isMust: true,
                  name: i.ruleName,
                  change: {} as any,
                  type: 'added',
                  isShould: false,
                }
              )
            )
          );
        }
        if (!parentLifecycle && parentFactAfter) {
          const rules = getRequirements(assertions);
          results.push(
            ...rules.map((i) =>
              wrapTest(
                () => i.assertion((parentFactAfter as any)[key], {} as any),
                {
                  where: `${key} requirement: `,
                  isMust: true,
                  name: i.ruleName,
                  change: {} as any,
                  type: 'requirement',
                  isShould: false,
                }
              )
            )
          );
        }
        if (parentLifecycle === 'changed') {
          const rules = getChangedRules(assertions);
          results.push(
            ...rules.map((i) =>
              wrapTest(
                () =>
                  i.assertion(
                    (parentFactBefore as any)[key],
                    (parentFactAfter as any)[key],
                    {} as any
                  ),
                {
                  where: `${key} changed: `,
                  isMust: true,
                  name: i.ruleName,
                  change: {} as any,
                  type: 'changed',
                  isShould: false,
                }
              )
            )
          );
        }
      }
    },
  };

  return tester;
}

export function wrapTest(
  run: () => void,
  result: Omit<Result, 'passed' | 'error'>
): Result {
  try {
    run();
    return { ...result, passed: true };
  } catch (e: any) {
    return { ...result, passed: false, error: e.message };
  }
}
