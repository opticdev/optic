import yaml from 'yaml';
import fs from 'fs';
import { logger } from '../logger';

// merges a yaml document into the existing optic.yml and writes it to disk. if newDocument's top-level
// key already exists in the Optic config, it is overwritten.
export function updateOpticConfig(
  newDocument: yaml.Document.Parsed,
  opticConfigPath: string
) {
  try {
    let opticYml = yaml.parseDocument(fs.readFileSync(opticConfigPath, 'utf8'));

    const topLevelKey = Object.keys(newDocument.toJSON())[0];
    opticYml.set(topLevelKey, newDocument.get(topLevelKey));

    fs.writeFileSync(opticConfigPath, opticYml.toString());
  } catch (err) {
    throw err;
  }
}
