import yaml from 'yaml';
import fs from 'node:fs/promises';
import path from 'path';

export async function createOpticConfig(
  filePath: string,
  key: string,
  value: any
): Promise<string> {
  const opticYmlPath = path.join(filePath, 'optic.yml');
  const opticYml = new yaml.Document();
  opticYml.set(key, value);
  await fs.writeFile(opticYmlPath, opticYml.toString()).catch((err) => {
    throw err;
  });
  return opticYmlPath;
}

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

    // the assumption is that the document being merged only has a single top-level key
    // so we take the first index
    const topLevelKey = Object.keys(newDocument.toJSON())[0];
    opticYml.set(topLevelKey, newDocument.get(topLevelKey));

    await fs.writeFile(opticConfigPath, opticYml.toString());
  } catch (err) {
    throw err;
  }
}
