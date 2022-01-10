import { Checker } from '../checker';
import {
  IChange,
  OpenApiFact,
  newDocsLinkHelper,
} from '@useoptic/openapi-utilities';
const { assert } = require('chai'); // Using Assert style

const change: IChange<OpenApiFact> = {
  location: {
    kind: 'simulated',
    jsonPath: '/',
    conceptualPath: [],
    conceptualLocation: {
      path: '/simulated',
      method: 'get',
    },
  },
} as any;

it('checks can run / fail using off-the-shelf test helpers', async (done) => {
  const check = new Checker();
  const docsHelper = newDocsLinkHelper();
  await check.runCheck(
    change,
    docsHelper,
    'location',
    'is a thing',
    true,
    () => {
      docsHelper.includeDocsLink('https://gitlab.com');
      assert(false, "it's broken!!!");
    }
  );
  const docsHelper2 = newDocsLinkHelper();
  await check.runCheck(
    change,
    docsHelper2,
    'location',
    'is a an ok thing',
    true,
    () => {
      docsHelper2.includeDocsLink('https://github.com');
      assert(true, "it's broken if you see this");
    }
  );

  expect(check.listResults()).toMatchSnapshot();
  done();
});
