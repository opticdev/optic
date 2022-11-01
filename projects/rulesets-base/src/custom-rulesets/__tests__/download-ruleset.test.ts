import { downloadRuleset } from '../download-ruleset';
import fetch, { Response } from 'node-fetch';
import zlib from 'node:zlib';
import fs from 'node:fs/promises';

jest.mock('node-fetch');
jest.mock('node:fs/promises');

describe('downloadRuleset', () => {
  test('throws on load error', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'Missing',
    } as Response);

    await expect(() =>
      downloadRuleset('test-ruleset', 'https://some-url.com')
    ).rejects.toThrow(new Error('Downloading ruleset failed (404): Missing'));
  });

  test('decrypts and writes to disk', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      buffer: async () => zlib.brotliCompressSync('Some ruleset data'),
    } as Response);

    await downloadRuleset('test-ruleset', 'https://some-url.com');
    expect((fs.mkdir as any)).toBeCalled();
    expect((fs.writeFile as any)).toHaveBeenCalledWith(
      expect.stringMatching(/test-ruleset.js$/),
      Buffer.from('Some ruleset data')
    );
  });
});
