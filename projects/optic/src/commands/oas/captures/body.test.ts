import { describe, it, expect } from '@jest/globals';
import { CapturedBody } from './body';

describe('CaputeredBody', () => {
  it('can be created and parsed', async () => {
    const testString = 'any string will do';
    const justBody = CapturedBody.from(testString);

    expect(await CapturedBody.text(justBody)).toEqual(testString);
    expect(CapturedBody.text(justBody)).rejects.toThrow();
    expect(justBody.contentType).toBeNull();

    const testJson = { a: 1, b: '2', c: { d: 3 }, e: [null] };
    const jsonBody = CapturedBody.fromJSON(testJson);

    expect(await CapturedBody.json(jsonBody)).toEqual(testJson);

    const withContentType = CapturedBody.from(testString, 'application/text');
    expect(withContentType.contentType).toEqual('application/text');

    let arrayBuffer = await CapturedBody.arrayBuffer(withContentType);
    expect(new Uint8Array(arrayBuffer)).toMatchSnapshot();
  });

  it('will respect body sizes', async () => {
    const testString = 'any string will do';
    const testBuffer = Buffer.from(testString, 'utf-8');
    const size = testBuffer.byteLength;

    const correctSize = CapturedBody.from(testBuffer, null, size);

    expect(await CapturedBody.text(correctSize)).toEqual(testString);

    const tooSmall = CapturedBody.from(testBuffer, null, size - 1);

    expect(CapturedBody.text(tooSmall)).rejects.toThrow();
  });
});
