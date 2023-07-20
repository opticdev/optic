import yaml from 'yaml';
import fs from 'node:fs/promises';

// merges a yaml document into the existing optic.yml and writes it to disk. if newDocument's top-level
// key already exists in the Optic config, it is overwritten.
export async function updateOpticConfig(
  newDocument: yaml.Document.Parsed,
  opticConfigPath: string
) {
  try {
    let opticYml = yaml.parseDocument(
      await fs.readFile(opticConfigPath, 'utf8')
    );

    const topLevelKey = Object.keys(newDocument.toJSON())[0];
    opticYml.set(topLevelKey, newDocument.get(topLevelKey));

    await fs.writeFile(opticConfigPath, opticYml.toString());
  } catch (err) {
    throw err;
  }
}
