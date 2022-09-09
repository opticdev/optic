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

test('throws for unsupported spec version', () => {
  expect(() => checkOpenAPIVersion({ openapi: '2.0.2' })).toThrow();
});
