import yaml from 'yaml';

export function writeYaml(document: any) {
  return yaml.stringify(document, {
    aliasDuplicateObjects: false,
    lineWidth: 0,
  });
}
export function loadYaml(contents: string) {
  return yaml.parse(contents);
}

export function isJson(filePath: string) {
  return filePath.endsWith('.json');
}
export function isYaml(filePath: string) {
  return filePath.endsWith('.yml') || filePath.endsWith('.yaml');
}
