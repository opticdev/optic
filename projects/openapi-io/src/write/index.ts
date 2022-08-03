import { dump as yamlDump, load as yamlLoad } from 'js-yaml';

export function writeYaml(document: any, indent: 2 | 4 = 2) {
  return yamlDump(document, { indent, noRefs: true });
}

export function loadYaml(contents: string) {
  return yamlLoad(contents);
}

export function isJson(filePath: string) {
  return filePath.endsWith('.json');
}
export function isYaml(filePath: string) {
  return filePath.endsWith('.yml') || filePath.endsWith('.yaml');
}
