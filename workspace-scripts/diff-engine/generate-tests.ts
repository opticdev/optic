import fs from 'fs-extra';
import Path from 'path';
import Crypto from 'crypto';

async function main(options: { inputBaseDir: string; outputBaseDir: string }) {
  // we'll dump copies of inputs here
  const contentAddressableInputBaseDir = Path.join(
    options.outputBaseDir,
    'fixtures',
    'domain-conflict-scenarios'
  );
  await fs.ensureDir(contentAddressableInputBaseDir);
  debugger;
  const prelude = `
// DO NOT EDIT! This file was generated via workspace-scripts/diff-engine/generate-tests
use insta::assert_debug_snapshot;
use optic_diff_engine::{SpecEvent, SpecProjection, diff_interaction, HttpInteraction};
use petgraph::dot::Dot;
use serde_json::json;`;
  debugger;
  const inputItems = await fs.readdir(options.inputBaseDir);

  const filteredInputItems = inputItems.filter((x) => x.endsWith('-spec.json'));
  if (filteredInputItems.length === 0) {
    throw new Error(`expected to see spec files ending with -spec.json`);
  }
  const inputInteractionsFileName = inputItems.find((x) =>
    x.endsWith('interactions.json')
  );
  if (!inputInteractionsFileName) {
    throw new Error(`expected to see a file named interactions.json`);
  }

  const inputInteractionsPath = Path.join(
    options.inputBaseDir,
    inputInteractionsFileName
  );

  const interactionsFilePath = Path.join(
    contentAddressableInputBaseDir,
    `interactions.json`
  );
  await fs.copyFile(inputInteractionsPath, interactionsFilePath);

  debugger;
  const testsPromises = filteredInputItems.map(async (inputItem) => {
    const inputItemPath = Path.join(options.inputBaseDir, inputItem);

    const contents = await fs.readFile(inputItemPath);
    const scenarioIdentifier = await checksum(inputItemPath);
    const prefix = `scenario_${scenarioIdentifier}`;
    const eventsFilePath = Path.join(
      contentAddressableInputBaseDir,
      `events-${scenarioIdentifier}.json`
    );
    await fs.writeFile(eventsFilePath, contents);
    return `
#[test]
pub fn ${prefix}() {
    let spec_file_path = "${eventsFilePath}";
    let interactions_file_path="${interactionsFilePath}";
    let events = SpecEvent::from_file(spec_file_path)
        .expect("should be able to deserialize events");
    let spec_projection = SpecProjection::from(events);
    
    assert_debug_snapshot!(
        "${prefix}__shape_graph",
        Dot::with_config(&spec_projection.shape().graph, &[])
    );
    assert_debug_snapshot!(
        "${prefix}__endpoints_graph",
        Dot::with_config(&spec_projection.endpoint().graph, &[])
    );
    assert_debug_snapshot!("${prefix}__conflicts_graph",
        Dot::with_config(&spec_projection.conflicts().graph, &[])
    );
    
    let interactions_string =  std::fs::read_to_string(interactions_file_path).expect("expected interactions file to be readable");
    let interactions: Vec<HttpInteraction> = serde_json::from_str(&interactions_string).unwrap();
    for interaction in interactions
    {
        let label = format!("${prefix}__interaction_{}__diffs" , interaction.uuid.clone());
        let diffs = diff_interaction(&spec_projection, interaction);
        assert_debug_snapshot!(label, diffs);
    }
}`;
  });
  const tests = await Promise.all(testsPromises);
  const testManifestTemplate = `
  ${prelude}
  ${tests.join('')}`;

  const testManifestFilePath = Path.join(
    options.outputBaseDir,
    'domain-conflict-scenarios-generated.rs'
  );

  await fs.writeFile(testManifestFilePath, testManifestTemplate);
}

async function checksum(fileName: string): Promise<string> {
  let shasum = Crypto.createHash('sha256');
  let s = fs.createReadStream(fileName);
  for await (const data of s) {
    shasum.update(data);
  }
  const hash = shasum.digest('hex');
  return hash;
}

const [, , inputBaseDir] = process.argv;
main({
  outputBaseDir: Path.join(
    process.cwd(),
    'workspaces',
    'optic-engine-native',
    'tests'
  ),
  inputBaseDir,
});
