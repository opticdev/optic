import { IgnoreFileHelper } from '../../src/helpers/ignore-file-interface';
import * as path from 'path';
import fs from 'fs-extra';

test('can parse rules from file, with Optic yml ones included', async () => {
  const ignoreHelper = new IgnoreFileHelper(
    path.join(__dirname, 'examples', 'ignore1'),
    path.join(__dirname, 'examples', 'optic1.yml')
  );

  const rules = await ignoreHelper.getCurrentIgnoreRules();
  console.log(rules);
  expect(rules).toMatchSnapshot();
});

test('can append new rule to file', async () => {
  const v2 = path.join(__dirname, 'examples', 'ignore2');
  await fs.copyFile(path.join(__dirname, 'examples', 'ignore1'), v2);

  const ignoreHelper = new IgnoreFileHelper(
    v2,
    path.join(__dirname, 'examples', 'optic1.yml')
  );

  await ignoreHelper.appendRule('POST /hello-world');
  const contents = (await fs.readFile(v2)).toString();
  fs.unlink(v2);
  expect(contents).toMatchSnapshot();
});
