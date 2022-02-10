import { JsonRoundtripConfig } from '../json';
import stringifyJson from 'json-stable-stringify';
import { jsonSpacer } from './lines';
import { safeLoad } from 'yaml-ast-parser';
import { writeYaml } from '../../write';
import { YamlRoundTripConfig } from '../yaml';

function generatedAddedField(
  key: string,
  fieldValue: any,
  writeConfig: YamlRoundTripConfig
): string {
  const simulated = { [key]: fieldValue };
  const formatted = writeYaml(simulated, writeConfig.count);
  const oneAndOnlyMapping = safeLoad(formatted).mappings[0];
  const asString = formatted.substring(
    oneAndOnlyMapping.startPosition,
    oneAndOnlyMapping.endPosition
  );
  return asString;
}

function generatedAdded(
  fieldValue: any,
  writeConfig: YamlRoundTripConfig
): string {
  return writeYaml(fieldValue, writeConfig.count).trimEnd();
}

export default { generatedAdded, generatedAddedField };
