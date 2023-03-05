import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { getParameterIdentity } from './array-identifiers';
import { FlatOpenAPIV3 } from '../flat-openapi-types';

const methods = `{get,post,put,delete,patch,head,options}`;
export const isPathParameterArray = (pointer: string): boolean => {
  return (
    jsonPointerHelpers.matches(pointer, ['paths', '**', 'parameters']) ||
    jsonPointerHelpers.matches(pointer, ['paths', '**', methods, 'parameters'])
  );
};

export const isPathsMap = (pointer: string): boolean => {
  return jsonPointerHelpers.matches(pointer, ['paths']);
};
