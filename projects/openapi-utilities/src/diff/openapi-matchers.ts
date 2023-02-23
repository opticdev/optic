import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { getParameterIdentity } from './array-identifiers';

export const isPathParameterArray = (pointer: string): boolean => {
  return (
    jsonPointerHelpers.matches(pointer, ['paths', '**', 'parameters']) ||
    jsonPointerHelpers.matches(pointer, [
      'paths',
      '**',
      '!parameters',
      'parameters',
    ])
  );
};

export const isPathsMap = (pointer: string): boolean => {
  return jsonPointerHelpers.matches(pointer, ['paths']);
};
