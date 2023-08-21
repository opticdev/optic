import yaml from 'yaml';
import fs from 'node:fs/promises';
import path from 'path';
import { OpticCliConfig } from '../config';

// merges a yaml document into the existing optic.yml and writes it to disk. if newDocument's top-level
// key already exists in the Optic config, it is overwritten.
export async function updateOpticConfig(
  newDocument: yaml.Document.Parsed,
  filePath: string,
  config: OpticCliConfig
): Promise<string> {
  let opticYml = new yaml.Document();
  let configPath = config.configPath;
  if (configPath) {
    opticYml = yaml.parseDocument(await fs.readFile(configPath, 'utf8'));
  } else {
    configPath = path.join(config.root, 'optic.yml');
  }

  opticYml.setIn(['capture', filePath], newDocument);
  await fs.writeFile(configPath, opticYml.toString());

  return configPath;
}
