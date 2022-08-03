import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function normalizeJsonPointer(jsonPointer: string): string {
  const normalizedComponents = jsonPointerHelpers
    .decode(jsonPointer)
    .map((component) => {
      const isArrayIndex = !isNaN(component as any);
      if (isArrayIndex) {
        return '0';
      } else {
        return component;
      }
    });

  return jsonPointerHelpers.compile(normalizedComponents);
}
