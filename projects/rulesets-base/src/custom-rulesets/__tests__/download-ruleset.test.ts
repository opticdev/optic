import { downloadRuleset } from '../download-ruleset';
import fetch, { Response } from 'node-fetch';
import zlib from 'node:zlib';
import fs from 'node:fs/promises';

jest.mock('node-fetch');
jest.mock('node:fs/promises');

describe('downloadRuleset', () => {
  test('throws on load error', async () => {
    (fs.access as any).mockRejectedValue(new Error('file does not exist'));
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'Missing',
    } as Response);

    await expect(() =>
      downloadRuleset(
        'test-ruleset',
        'https://some-url.com',
        '2022-11-01T19:32:22.148Z'
      )
    ).rejects.toThrow(new Error('Downloading ruleset failed (404): Missing'));
  });

  test('decrypts and writes to disk', async () => {
    (fs.access as any).mockRejectedValue(new Error('file does not exist'));
    (fetch as any).mockResolvedValue({
      ok: true,
      buffer: async () => zlib.brotliCompressSync('Some ruleset data'),
    } as Response);

    await downloadRuleset(
      'test-ruleset',
      'https://some-url.com',
      '2022-11-01T19:32:22.148Z'
    );
    expect(fs.mkdir).toBeCalled();
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/test-ruleset.js$/),
      Buffer.from('Some ruleset data')
    );
  });

  test('uses cached files when possible', async () => {
    (fs.access as any).mockResolvedValue(true);
    await downloadRuleset(
      'test-ruleset',
      'https://some-url.com',
      '2022-11-01T19:32:22.148Z'
    );

    expect(fetch).not.toBeCalled();
  });
});
