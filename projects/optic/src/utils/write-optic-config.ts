import yaml from 'yaml';
import fs from 'fs';
import { logger } from '../logger';

// merges a yaml document into the existing optic.yml and writes it to disk
export function updateOpticConfig(
  newDocument: yaml.Document.Parsed,
  opticConfigPath: string
) {
  try {
    // parse optic.yml
    const opticYml = yaml.parseDocument(
      fs.readFileSync(opticConfigPath, 'utf8')
    );

    // merge new document
    opticYml.add(newDocument.contents);

    // write to optic.yml
    fs.writeFileSync(opticConfigPath, opticYml.toString());
  } catch (err) {
    logger.error(err);
  }
}
