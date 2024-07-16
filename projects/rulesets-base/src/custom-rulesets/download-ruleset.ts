import fetch from 'node-fetch';
import zlib from 'node:zlib';
import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function downloadRuleset(
  name: string,
  url: string,
  uploaded_at: string,
  should_decompress: boolean
): Promise<string> {
  const filepath = path.join(os.tmpdir(), name, `${uploaded_at}.js`);
  try {
    await fs.access(filepath);
    // If the file exists, we have this file in the cache and can return filepath
    return filepath;
  } catch (e) {}

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(
      `Downloading ruleset failed (${resp.status}): ${await resp.text()}`
    );
  }
  let raw: Buffer;
  if (should_decompress) {
    const compressed = await resp.buffer();
    raw = zlib.brotliDecompressSync(compressed);
  } else {
    raw = await resp.buffer();
  }

  const filefolder = path.dirname(filepath);
  // Does not error if folder exists when recursive = true
  await fs.mkdir(filefolder, { recursive: true });
  await fs.writeFile(filepath, raw);

  return filepath;
}
