import stringifyJson from 'json-stable-stringify';
import { jsonSpacer } from './lines';
import { safeLoad } from 'yaml-ast-parser';
import { JsonRoundtripConfig } from '../write-surgical/json';

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
  const formatted = stringifyJson(simulated, {
    space: jsonSpacer(writeConfig),
  });
  const oneAndOnlyMapping = safeLoad(formatted).mappings[0];
  const asString = formatted.substring(
    oneAndOnlyMapping.startPosition,
    oneAndOnlyMapping.endPosition
  );
  return asString;
}

function generatedAdded(fieldValue: any, writeConfig: JsonRoundtripConfig) {
  return stringifyJson(fieldValue, { space: jsonSpacer(writeConfig) });
}

export default {
  isObject,
  generatedAddedField,
  generatedAdded,
  isArray,
};
