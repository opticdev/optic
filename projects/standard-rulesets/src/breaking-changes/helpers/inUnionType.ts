import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function isInUnionProperty(jsonPath: string): boolean {
  const parts = jsonPointerHelpers.decode(jsonPath);
  return parts.some((p) => p === 'oneOf' || p === 'anyOf');
}
