import { JsonRoundtripConfig } from '../../json';

const prettier = require('prettier');

const plugins = [
  require('prettier/parser-yaml'),
  require('prettier/parser-typescript'),
];

export function formatJson(
  jsonString: string,
  writeConfig: JsonRoundtripConfig
) {
  return prettier.format(jsonString, {
    parser: 'json',
    useTabs: writeConfig.spacer === 'tab',
    tabWidth: writeConfig.count,
  });
}

export function formatYaml(yamlString: string) {
  return prettier.format(yamlString, {
    parser: 'yaml',
    plugins,
    proseWrap: 'preserve',
  });
}
