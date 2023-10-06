import { prepareRule } from '../prepare-rule';
import { test, expect, describe, jest } from '@jest/globals';
import { NaiveLocalCache } from '../rule-cache';
import * as fs from 'fs-extra';

jest.setTimeout(10000);

describe('can classify rules by openapi entity kind:', () => {
  test('All operations must have an operationId', async () => {
    const testName = expect.getState().currentTestName!.split(':')[1]!.trim();
    expect(await prepareRule(testName)).toMatchSnapshot();
  });
  test('operationId should never change', async () => {
    const testName = expect.getState().currentTestName!.split(':')[1]!.trim();
    expect(await prepareRule(testName)).toMatchSnapshot();
  });
  test('All query parameters should be optional', async () => {
    const testName = expect.getState().currentTestName!.split(':')[1]!.trim();
    expect(await prepareRule(testName)).toMatchSnapshot();
  });
  test('All responses that return an array must use pagination', async () => {
    const testName = expect.getState().currentTestName!.split(':')[1]!.trim();
    expect(await prepareRule(testName)).toMatchSnapshot();
  });
  test('No response returns an array. If it returns array data it is wrapped in an object ie. {"users": []}', async () => {
    const testName = expect
      .getState()
      .currentTestName!.split(':')
      .slice(1)
      .join()!
      .trim();
    expect(await prepareRule(testName)).toMatchSnapshot();
  });
});

describe('Nonsensical rules are skipped:', () => {
  test('All cats like jello', async () => {
    const testName = expect.getState().currentTestName!.split(':')[1]!.trim();
    expect(await prepareRule(testName)).toBe(undefined);
  });
  test('All dogs go to heaven', async () => {
    const testName = expect.getState().currentTestName!.split(':')[1]!.trim();
    expect(await prepareRule(testName)).toBe(undefined);
  });
  test('Does not look like the kubernetes API ', async () => {
    const testName = expect.getState().currentTestName!.split(':')[1]!.trim();
    expect(await prepareRule(testName)).toBe(undefined);
  });
});

test('cache saves rule preparation', async () => {
  const cache = new NaiveLocalCache();
  await cache.getOrPrepareRule('All operations must have an operationId');
  await cache.flushCache();
  const value = (await fs.readFile(cache.localFile)).toString();
  expect(value).toMatchSnapshot();
});
