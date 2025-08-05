import { isTruthyStringValue } from '@useoptic/openapi-utilities';
import { RuleContext } from '@useoptic/rulesets-base';
import { logger } from '../src/logger'

function extensionIsTruthy(extension: any) {
  if (typeof extension === 'string') {
    return isTruthyStringValue(extension);
  } else {
    return extension === true;
  }
}

export const excludeOperationWithExtensionMatches = (
  excludeOperationWithExtensions: string | string[] | { [key: string]: string[] }[]
) => {
  return (context: RuleContext): boolean => {
    const operation = context.operation.raw as any;

    // Case 1: A single extension string (e.g., 'x-legacy')
    if (typeof excludeOperationWithExtensions === 'string') {
      return !extensionIsTruthy(operation[excludeOperationWithExtensions]);
    }

    // Case 2: An array of extensions
    if (Array.isArray(excludeOperationWithExtensions)) {
      for (const exclusion of excludeOperationWithExtensions) {
        // Case 2a: Array of strings (e.g., ['x-legacy', 'x-internal'])
        if (typeof exclusion === 'string') {
          if (extensionIsTruthy(operation[exclusion])) {
            return false; // Exclude if any extension is truthy
          }
        }
        // Case 2b: Array of objects (e.g., [{ 'x-stability': ['beta'] }])
        else if (typeof exclusion === 'object' && exclusion !== null) {
          for (const [key, values] of Object.entries(exclusion)) {
            const extensionValue = operation[key];
            if (
              extensionValue &&
              values.includes(String(extensionValue))
            ) {
              logger.info(`Excluding operation: ${operation['operationId']} due to extension match`);
              return false; // Exclude if the extension value matches
            }
          }
        }
      }
    }
    return true; // Include by default if no exclusion matches
  };
};

