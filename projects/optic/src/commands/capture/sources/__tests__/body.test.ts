import { describe, it, expect } from '@jest/globals';
import { CapturedBody } from '../body';

describe('CaputeredBody', () => {
  it('can be created and parsed', async () => {
    const testString = 'any string will do';
    const justBody = CapturedBody.from(testString, 'text/plain');
    ('');
    expect(await CapturedBody.text(justBody)).toEqual(testString);

    const testJson = { a: 1, b: '2', c: { d: 3 }, e: [null] };
    const jsonBody = CapturedBody.fromJSON(testJson);

    expect(await CapturedBody.json(jsonBody)).toEqual(testJson);

    const withContentType = CapturedBody.from(testString, 'application/text');
    expect(withContentType.contentType).toEqual('application/text');
  });
});
