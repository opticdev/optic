import { test, expect } from '@jest/globals';
import { checkOpenAPIVersion } from './openapi-versions';

test('detects a 3.1.x openapi', async () => {
  expect(checkOpenAPIVersion({ openapi: '3.1.0' })).toBe('3.1.x');
  expect(checkOpenAPIVersion({ openapi: '3.1.1' })).toBe('3.1.x');
});

test('detects a 3.0.x openapi', async () => {
  expect(checkOpenAPIVersion({ openapi: '3.0.3' })).toBe('3.0.x');
  expect(checkOpenAPIVersion({ openapi: '3.0.2' })).toBe('3.0.x');
  expect(checkOpenAPIVersion({ openapi: '3.0.2' })).toBe('3.0.x');
});

test('detects a 2.x.x openapi', async () => {
  expect(checkOpenAPIVersion({ swagger: '2.0.3' })).toBe('2.x.x');
  expect(checkOpenAPIVersion({ swagger: '2.1.2' })).toBe('2.x.x');
});

test('throws for unsupported spec version', () => {
  expect(() => checkOpenAPIVersion({ openapi: '4.0.2' })).toThrow();
});
