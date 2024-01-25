import { isTruthyStringValue } from '@useoptic/openapi-utilities';
import { RuleContext } from '@useoptic/rulesets-base';

function extensionIsTruthy(extension: any) {
  if (typeof extension === 'string') {
    return isTruthyStringValue(extension);
  } else {
    return extension === true;
  }
}

export const excludeOperationWithExtensionMatches = (
  excludeOperationWithExtensions: string | string[]
) => {
  return (context: RuleContext): boolean => {
    return Array.isArray(excludeOperationWithExtensions)
      ? excludeOperationWithExtensions.some(
          (e) => !extensionIsTruthy((context.operation.raw as any)[e])
        )
      : !extensionIsTruthy(
          (context.operation.raw as any)[excludeOperationWithExtensions]
        );
  };
};
