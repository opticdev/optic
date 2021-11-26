import stringifyJson from 'json-stable-stringify';
import { spacer } from './lines';
import { safeLoad } from 'yaml-ast-parser';
import { JsonRoundtripConfig } from '../json';

export function isObject(val: any) {
  return typeof val === 'object' && !Array.isArray(val) && val !== null;
}
export function isArray(val: any) {
  return Array.isArray(val);
}

function generatedAddedField(
  key: string,
  fieldValue: any,
  writeConfig: JsonRoundtripConfig
): string {
  const simulated = { [key]: fieldValue };
  const formatted = stringifyJson(simulated, { space: spacer(writeConfig) });
  const oneAndOnlyMapping = safeLoad(formatted).mappings[0];
  const asString = formatted.substring(
    oneAndOnlyMapping.startPosition,
    oneAndOnlyMapping.endPosition
  );
  return asString;
}

function generatedAdded(fieldValue: any, writeConfig: JsonRoundtripConfig) {
  return stringifyJson(fieldValue, { space: spacer(writeConfig) });
}

export default {
  isObject,
  generatedAddedField,
  generatedAdded,
  isArray,
};
