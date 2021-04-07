import * as path from 'path';
import {resolveConflictsIfPresent, getSpecEventsFrom} from "../../src/helpers/read-specification-json";
// @ts-ignore
import fs from "fs-extra";
test('can parse a specification.json with a git conflict', async () => {
  const specStorePath = path.join(__dirname, 'examples', 'conflict1.json')
  const rawSpecFileJson = await fs.readFile(path.join(__dirname, 'examples', 'conflict1.json'),  'utf8');
  const result = await resolveConflictsIfPresent(rawSpecFileJson, specStorePath, true)
  expect(result).toMatchSnapshot();
});

test('can parse a specification.json without a git conflict', async () => {
  const specStorePath = path.join(__dirname, 'examples', 'noconflict.json')
  const result = await getSpecEventsFrom(specStorePath)
  expect(result).toMatchSnapshot();
});
