import * as fs from 'fs';
import Tap from 'tap';
import { generateEndpointChanges } from '../src';

function loadSpecs(scenario: string) {
  return {
    initialSpec: JSON.parse(
      fs.readFileSync(`./test/specs/${scenario}/initial.json`).toString(),
    ),
    newSpec: JSON.parse(
      fs.readFileSync(`./test/specs/${scenario}/new.json`).toString(),
    ),
  };
}

const scenarios = fs
  .readdirSync('./test/specs', { withFileTypes: true })
  .filter((item) => item.isDirectory())
  .map((item) => item.name);

scenarios.forEach((scenario) => {
  Tap.test(`Check ${scenario} scenario`, async (test) => {
    const { initialSpec, newSpec } = loadSpecs(scenario);
    const result = await generateEndpointChanges(initialSpec, newSpec);
    test.matchSnapshot(result);
  });
});
