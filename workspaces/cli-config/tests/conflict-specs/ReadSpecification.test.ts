import * as path from 'path';
import {resolveConflictsIfPresent} from "../../src/helpers/read-specification-json";
// @ts-ignore
import fs from "fs-extra";

test('can parse a specification.json with a git conflict', async () => {
  const specStorePath = path.join(__dirname, 'examples', 'conflict1.json')
  const rawSpecFileJson = await fs.readFile(path.join(__dirname, 'examples', 'conflict1.json'),  'utf8');
  const result = await resolveConflictsIfPresent(rawSpecFileJson, specStorePath, true)
  expect(result).toMatchSnapshot();
});
