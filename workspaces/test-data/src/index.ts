import { allScenarios } from './helpers/Scenario';
import slugify from 'slugify';
import * as fs from 'fs-extra';
import * as path from 'path';

function getAllScenarios() {
  //Require all scenarios
  require('./scenarios/ObjectKeys');
  require('./scenarios/UnknownConversions');
  require('./scenarios/Arrays');
  require('./scenarios/Optionals');

  console.log(`Collected ${allScenarios.length}`);
}

function dumpToDisk() {
  getAllScenarios();

  const input = path.resolve('../snapshot-tests/inputs');
  const inputEvents = path.join(input, 'events');
  const inputInteractions = path.join(input, 'interactions');

  allScenarios.map(async (i) => {
    const { scenario, case: name, events, interaction } = i;
    const slug = slugify('gen_' + scenario);
    //dump events
    fs.ensureDir(path.join(inputEvents, slug));
    fs.writeJSON(path.join(inputEvents, slug, 'v0.json'), events, {
      spaces: 2,
    });

    //dump interaction
    fs.ensureDir(path.join(inputInteractions, slug));
    const slugCase = slugify(name);
    fs.writeJSON(
      path.join(inputInteractions, slug, `${slugCase}.json`),
      interaction,
      {
        spaces: 2,
      }
    );
  });
}

dumpToDisk();
